require("dotenv").config();

const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 3000;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const TABLE_NAME = process.env.DYNAMODB_TABLE || "BookNookBooks";
const S3_BUCKET = process.env.S3_BUCKET;

const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: AWS_REGION });

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BookNook API on AWS",
    endpoints: [
      "GET /api/health",
      "GET /api/books",
      "GET /api/books/:id",
      "POST /api/books",
      "PUT /api/books/:id",
      "DELETE /api/books/:id",
      "POST /api/books/:id/cover"
    ]
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        Limit: 1
      })
    );

    res.json({
      status: "healthy",
      database: "DynamoDB connected",
      storage: S3_BUCKET ? "S3 configured" : "S3 bucket missing",
      region: AWS_REGION
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message
    });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const { title, author, genre, notes } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        error: "Title and author are required"
      });
    }

    const book = {
      id: crypto.randomUUID(),
      title,
      author,
      genre: genre || "Fiction",
      status: "To Read",
      rating: null,
      notes: notes || "",
      coverUrl: "",
      addedAt: new Date().toISOString()
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: book
      })
    );

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const { status } = req.query;

    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME
      })
    );

    let books = result.Items || [];

    if (status) {
      books = books.filter(
        (book) => book.status.toLowerCase() === status.toLowerCase()
      );
    }

    res.json(books);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        }
      })
    );

    if (!result.Item) {
      return res.status(404).json({
        error: "Book not found"
      });
    }

    res.json(result.Item);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const { title, author, genre, status, rating, notes } = req.body;

    const existingBook = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        }
      })
    );

    if (!existingBook.Item) {
      return res.status(404).json({
        error: "Book not found"
      });
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        },
        UpdateExpression:
          "SET title = :title, author = :author, genre = :genre, #status = :status, rating = :rating, notes = :notes",
        ExpressionAttributeNames: {
          "#status": "status"
        },
        ExpressionAttributeValues: {
          ":title": title || existingBook.Item.title,
          ":author": author || existingBook.Item.author,
          ":genre": genre || existingBook.Item.genre || "Fiction",
          ":status": status || existingBook.Item.status || "To Read",
          ":rating":
            rating === undefined ? existingBook.Item.rating || null : rating,
          ":notes": notes || existingBook.Item.notes || ""
        },
        ReturnValues: "ALL_NEW"
      })
    );

    res.json(result.Attributes);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const existingBook = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        }
      })
    );

    if (!existingBook.Item) {
      return res.status(404).json({
        error: "Book not found"
      });
    }

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        }
      })
    );

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.post("/api/books/:id/cover", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded. Use form-data with key named file."
      });
    }

    if (!S3_BUCKET) {
      return res.status(500).json({
        error: "S3_BUCKET is not configured in .env"
      });
    }

    const existingBook = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        }
      })
    );

    if (!existingBook.Item) {
      return res.status(404).json({
        error: "Book not found"
      });
    }

    const fileExtension = req.file.originalname.split(".").pop();
    const key = `covers/book-${req.params.id}.${fileExtension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    const coverUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          id: req.params.id
        },
        UpdateExpression: "SET coverUrl = :coverUrl",
        ExpressionAttributeValues: {
          ":coverUrl": coverUrl
        },
        ReturnValues: "ALL_NEW"
      })
    );

    res.json({
      message: "Cover uploaded successfully",
      coverUrl,
      book: result.Attributes
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`BookNook AWS API running on port ${PORT}`);
});