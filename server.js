const { webcrypto } = require('crypto');

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
const express = require('express');
const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let pool;
let coverContainer;

async function initServices() {
  const credential = new DefaultAzureCredential();

  // Get SQL connection string from Azure Key Vault
  const kvUrl = process.env.KEY_VAULT_URL;

  if (!kvUrl) {
    throw new Error('KEY_VAULT_URL is missing. Please set it in your environment variables.');
  }

  const kvClient = new SecretClient(kvUrl, credential);
  const connSecret = await kvClient.getSecret('sql-connection-string');

  // Connect to Azure SQL Database
  pool = await sql.connect(connSecret.value);
  console.log('Connected to Azure SQL');

  // Connect to Azure Blob Storage
  const storageUrl = process.env.STORAGE_URL;

  if (!storageUrl) {
    throw new Error('STORAGE_URL is missing. Please set it in your environment variables.');
  }

  const blobService = new BlobServiceClient(storageUrl, credential);
  coverContainer = blobService.getContainerClient('covers');

  await coverContainer.createIfNotExists({ access: 'blob' });
  console.log('Connected to Blob Storage');
}

// ---------- HEALTH CHECK ----------
app.get('/api/health', async (req, res) => {
  try {
    await pool.request().query('SELECT 1');

    res.json({
      status: 'healthy',
      db: 'connected',
      storage: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

// ---------- LIST BOOKS ----------
app.get('/api/books', async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM Books';
    const request = pool.request();

    if (status) {
      query += ' WHERE Status = @status';
      request.input('status', sql.NVarChar, status);
    }

    query += ' ORDER BY AddedAt DESC';

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- GET SINGLE BOOK ----------
app.get('/api/books/:id', async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Books WHERE Id = @id');

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- ADD BOOK ----------
app.post('/api/books', async (req, res) => {
  try {
    const { title, author, genre, notes } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        error: 'Title and author are required'
      });
    }

    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('author', sql.NVarChar, author)
      .input('genre', sql.NVarChar, genre || 'Fiction')
      .input('notes', sql.NVarChar, notes || '')
      .query(`
        INSERT INTO Books (Title, Author, Genre, Notes, Status, AddedAt)
        OUTPUT INSERTED.*
        VALUES (@title, @author, @genre, @notes, 'To Read', GETUTCDATE())
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- UPDATE BOOK ----------
app.put('/api/books/:id', async (req, res) => {
  try {
    const { title, author, genre, status, rating, notes } = req.body;

    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('title', sql.NVarChar, title)
      .input('author', sql.NVarChar, author)
      .input('genre', sql.NVarChar, genre)
      .input('status', sql.NVarChar, status)
      .input('rating', sql.Int, rating)
      .input('notes', sql.NVarChar, notes)
      .query(`
        UPDATE Books
        SET Title = @title,
            Author = @author,
            Genre = @genre,
            Status = @status,
            Rating = @rating,
            Notes = @notes
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    if (!result.recordset.length) {
      return res.status(404).json({
        error: 'Book not found'
      });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- DELETE BOOK ----------
app.delete('/api/books/:id', async (req, res) => {
  try {
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Books WHERE Id = @id');

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- UPLOAD COVER IMAGE ----------
app.post('/api/books/:id/cover', upload.single('file'), async (req, res) => {
  try {
    const bookId = req.params.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    const ext = file.originalname.split('.').pop();
    const blobName = `book-${bookId}.${ext}`;
    const blockBlob = coverContainer.getBlockBlobClient(blobName);

    await blockBlob.upload(file.buffer, file.size, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    const coverUrl = blockBlob.url;

    await pool.request()
      .input('id', sql.Int, bookId)
      .input('coverUrl', sql.NVarChar, coverUrl)
      .query('UPDATE Books SET CoverUrl = @coverUrl WHERE Id = @id');

    res.status(201).json({
      message: 'Cover uploaded',
      coverUrl
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 3000;

initServices()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`BookNook API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
