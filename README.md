# BookNook API — Revived and Deployed on AWS

## GitHub Finish-Up-A-Thon Challenge Submission

BookNook is a personal reading tracker API that allows users to manage books they are reading, planning to read, or have completed.

This project was revived for the **GitHub Finish-Up-A-Thon Challenge**. I originally started BookNook as a local/cloud API experiment, but it was not fully completed or publicly deployed. For this challenge, I revived the project, migrated it to AWS, deployed it online, connected it to cloud storage/database services, and documented the before-and-after journey.

---

## Live Demo

### API Health Check

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "DynamoDB connected",
  "storage": "S3 configured",
  "region": "us-east-1"
}
```

### View All Books

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books
```

### Example Uploaded Book Cover

```text
https://booknook-covers-abuwa-2026.s3.us-east-1.amazonaws.com/covers/book-4cdfa13c-26a8-4882-906a-4f8302fbfe88.jpg
```

### Base API URL

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com
```

---

## GitHub Repository

```text
https://github.com/eghareabuwa-arch/booknook-api
```

Branches:

```text
main        - original/local-Azure version
aws-version - revived AWS-deployed version
```

---

## Project Summary

BookNook is a REST API built with **Node.js** and **Express.js**. It helps users track their reading list by storing books, reading progress, notes, ratings, and cover image links.

The revived AWS version uses:

- **AWS Elastic Beanstalk** to host the API online
- **Amazon DynamoDB** to store book records
- **Amazon S3** to store uploaded book cover images
- **AWS IAM roles and policies** to allow the deployed application to access DynamoDB and S3
- **GitHub** for version control
- **GitHub Copilot** for refactoring support, documentation prompts, and code improvement guidance

---

## What the API Can Do

The API supports the following operations:

- Add a new book
- View all books
- View one book by ID
- Update an existing book
- Delete a book
- Upload a book cover image
- Store book records in DynamoDB
- Store uploaded book cover images in S3
- Save the S3 cover image URL inside the book record

---

## Before: The Unfinished Project

The original BookNook project started as a local Node.js and Express API. I initially experimented with cloud services using Azure, including Azure SQL Database, Azure Blob Storage, and Azure Key Vault.

The earlier version helped me understand cloud-backed APIs, but the project was not fully finished because:

- It was mainly tested locally.
- The API link was not public.
- It was not deployed for external users or instructors to test.
- The documentation was not complete enough for a challenge submission.
- The Azure resources were later deleted due to cost concerns.
- The project needed a clearer completion arc and final public deployment.

At that stage, BookNook was functional as a prototype, but it was not fully shipped.

---

## After: The Revived AWS Version

For the GitHub Finish-Up-A-Thon Challenge, I revived BookNook by rebuilding the cloud backend on AWS and deploying the API publicly.

The revived version now has:

- A public API hosted on AWS Elastic Beanstalk
- Book records stored in Amazon DynamoDB
- Book cover image upload to Amazon S3
- A working public health endpoint
- A working public books endpoint
- A working live book cover image URL
- IAM role permissions fixed for DynamoDB and S3 access
- GitHub repository with an `aws-version` branch
- Challenge-ready documentation

The project moved from a local/unfinished prototype to a deployed cloud API that can be tested publicly.

---

## AWS Architecture

```text
Client / Browser / Postman / curl
        |
        v
AWS Elastic Beanstalk
(Node.js Express API)
        |
        |----> Amazon DynamoDB
        |      Stores book records
        |
        |----> Amazon S3
               Stores uploaded book cover images
```

### Why DynamoDB?

DynamoDB stores structured book data such as:

```text
id
title
author
genre
status
rating
notes
coverUrl
addedAt
```

### Why S3?

S3 stores image files. Instead of saving image files directly inside the database, the API uploads book cover images to S3 and saves the generated image URL in DynamoDB.

This keeps the database clean and allows cover images to be viewed through a public S3 URL.

---

## API Endpoints

| Method | Endpoint               | Description                                |
| ------ | ---------------------- | ------------------------------------------ |
| GET    | `/`                    | Welcome endpoint                           |
| GET    | `/api/health`          | Checks API, DynamoDB, and S3 configuration |
| GET    | `/api/books`           | Returns all books                          |
| GET    | `/api/books/:id`       | Returns one book by ID                     |
| POST   | `/api/books`           | Adds a new book                            |
| PUT    | `/api/books/:id`       | Updates an existing book                   |
| DELETE | `/api/books/:id`       | Deletes a book                             |
| POST   | `/api/books/:id/cover` | Uploads a book cover image to S3           |

---

## Example API Usage

### 1. Health Check

```bash
curl http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "database": "DynamoDB connected",
  "storage": "S3 configured",
  "region": "us-east-1"
}
```

---

### 2. Add a Book

```bash
curl -X POST http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Things Fall Apart",
    "author": "Chinua Achebe",
    "genre": "African Literature",
    "notes": "A classic African novel deployed on AWS"
  }'
```

Example returned book ID:

```text
4cdfa13c-26a8-4882-906a-4f8302fbfe88
```

---

### 3. View All Books

```bash
curl http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books
```

---

### 4. View One Book

```bash
curl http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books/4cdfa13c-26a8-4882-906a-4f8302fbfe88
```

---

### 5. Update a Book

```bash
curl -X PUT http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books/4cdfa13c-26a8-4882-906a-4f8302fbfe88 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Finished",
    "rating": 5,
    "notes": "Completed and highly recommended"
  }'
```

---

### 6. Delete a Book

```bash
curl -X DELETE http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books/4cdfa13c-26a8-4882-906a-4f8302fbfe88
```

---

### 7. Upload a Book Cover Image

```bash
curl -X POST "http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books/4cdfa13c-26a8-4882-906a-4f8302fbfe88/cover" \
  -F "file=@/path/to/book-cover.jpg"
```

Successful response:

```json
{
  "message": "Cover uploaded successfully",
  "coverUrl": "https://booknook-covers-abuwa-2026.s3.us-east-1.amazonaws.com/covers/book-4cdfa13c-26a8-4882-906a-4f8302fbfe88.jpg"
}
```

Live uploaded cover image:

```text
https://booknook-covers-abuwa-2026.s3.us-east-1.amazonaws.com/covers/book-4cdfa13c-26a8-4882-906a-4f8302fbfe88.jpg
```

---

## Technologies Used

- Node.js
- Express.js
- AWS SDK for JavaScript v3
- Amazon DynamoDB
- Amazon S3
- AWS Elastic Beanstalk
- AWS IAM
- Git
- GitHub
- GitHub Copilot
- VS Code
- curl
- Postman

---

## How GitHub Copilot Helped

GitHub Copilot supported the completion of this project in several ways:

### 1. Refactoring Support

I used Copilot to help think through how to move the project from the earlier Azure-style structure to an AWS-based structure using DynamoDB and S3.

### 2. Endpoint Consistency

Copilot helped me keep the API endpoint structure consistent while changing the underlying cloud services.

The API maintained familiar routes such as:

```text
GET /api/health
POST /api/books
GET /api/books
PUT /api/books/:id
DELETE /api/books/:id
POST /api/books/:id/cover
```

### 3. Code Review and Improvement

Copilot helped review the Express API structure and suggested clearer error handling and cleaner organization.

### 4. Documentation Support

Copilot helped generate and organize documentation sections such as:

- Project overview
- Before and after journey
- API endpoints
- AWS architecture
- Example curl commands
- Challenge reflection

### 5. Debugging Guidance

During the revival, I encountered package and permission issues. Copilot helped with application-side review while I fixed the AWS IAM permission problems.

---

## Challenges Faced and How I Solved Them

### 1. Moving Away from Azure Due to Cost

The earlier version used Azure resources, but I deleted the Azure resource group because of cost concerns. I decided to move the revived version to AWS using available AWS free credit.

### 2. Migrating the Backend Idea to AWS

The previous approach used Azure services. I rebuilt the backend to use:

```text
Azure SQL / local database idea  -> Amazon DynamoDB
Azure Blob Storage idea          -> Amazon S3
Local-only API                   -> AWS Elastic Beanstalk deployment
```

### 3. UUID Package Compatibility Issue

The `uuid` package caused a compatibility problem with `require()`. I fixed this by using Node.js built-in:

```js
crypto.randomUUID();
```

### 4. Elastic Beanstalk DynamoDB Permission Error

After deployment, the health endpoint returned an unhealthy response because the Elastic Beanstalk EC2 role did not have permission to scan the DynamoDB table.

The role involved was:

```text
aws-elasticbeanstalk-ec2-role
```

The missing action was:

```text
dynamodb:Scan
```

I fixed this by attaching DynamoDB permission to the Elastic Beanstalk EC2 role.

### 5. S3 Upload Permission Error

The deployed API initially failed to upload cover images to S3 because the Elastic Beanstalk EC2 role did not have permission to perform:

```text
s3:PutObject
```

I fixed this by attaching S3 permission to the Elastic Beanstalk EC2 role.

### 6. S3 Public Access Issue

After the image uploaded, the image URL initially returned `AccessDenied` in the browser. I fixed this by updating the S3 bucket public access and bucket policy so the uploaded cover image could be viewed publicly.

---

## Screenshots

Screenshots for the project are stored in the `screenshots` folder.

### After Deployment Screenshots

| Stage                         | Screenshot                                |
| ----------------------------- | ----------------------------------------- |
| AWS health endpoint           | `screenshots/after-eb-health.png`         |
| Live books endpoint           | `screenshots/after-api-books.png`         |
| Elastic Beanstalk environment | `screenshots/after-elastic-beanstalk.png` |
| DynamoDB table                | `screenshots/after-dynamodb-table.png`    |
| S3 bucket                     | `screenshots/after-s3-bucket.png`         |
| Uploaded S3 cover image       | `screenshots/after-s3-cover-opened.png`   |

---

## Judging Criteria Alignment

### 1. Use of Underlying Technology

The project uses multiple real cloud technologies working together:

- Node.js and Express for the backend API
- AWS Elastic Beanstalk for deployment
- Amazon DynamoDB for persistent NoSQL storage
- Amazon S3 for object/image storage
- IAM roles and policies for cloud permissions
- GitHub branches for version control and project history

### 2. Usability and User Experience

The API is simple to test using browser, curl, or Postman. The `/api/health` endpoint provides a clear status response showing whether the app is connected to DynamoDB and S3.

The `/api/books` endpoint allows users to view stored books, and the cover upload endpoint connects the book record to a real S3 image URL.

### 3. Originality and Creativity

BookNook solves a practical personal problem: tracking books and reading progress. The revived version adds cloud-based persistence and cover image upload, turning a simple reading tracker idea into a deployable backend service.

### 4. Completion Arc

The project has a clear before-and-after journey.

Before:

```text
Local prototype
Azure experiment
No public API link
Incomplete deployment
Incomplete documentation
Not submission-ready
```

After:

```text
AWS-deployed API
DynamoDB database
S3 cover image upload
Public API health endpoint
Public books endpoint
Public cover image URL
GitHub repository and AWS branch
Challenge-ready documentation
```

---

## Local Development Setup

Clone the repository:

```bash
git clone https://github.com/eghareabuwa-arch/booknook-api.git
cd booknook-api
git checkout aws-version
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
AWS_REGION=us-east-1
DYNAMODB_TABLE=BookNookBooks
S3_BUCKET=your-s3-bucket-name
PORT=3000
```

Start the development server:

```bash
npm run dev
```

Test locally:

```bash
curl http://localhost:3000/api/health
```

---

## Deployment Summary

The project was deployed to AWS Elastic Beanstalk using a single EC2 instance environment:

```bash
eb create booknook-api-prod --single
```

Environment variables were configured using:

```bash
eb setenv AWS_REGION=us-east-1 DYNAMODB_TABLE=BookNookBooks S3_BUCKET=booknook-covers-abuwa-2026
```

The public API became available at:

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com
```

---

## Security Note

The `.env` file is ignored and should not be committed to GitHub.

Sensitive values such as AWS access keys, secret keys, GitHub tokens, passwords, and environment files should never be exposed in code, screenshots, or documentation.

For this demo, broader AWS managed policies were used to complete the project quickly. In a production system, I would replace these with least-privilege policies limited only to the required DynamoDB table and S3 bucket.

---

## Future Improvements

- Add a frontend interface
- Add user authentication
- Add search by title, author, or genre
- Add pagination for book lists
- Add reading statistics
- Add automated tests
- Add GitHub Actions CI/CD deployment to AWS
- Replace broad IAM permissions with least-privilege custom policies
- Improve S3 upload validation for file size and file type

---

## Final Status

BookNook has been revived, migrated to AWS, deployed publicly, connected to DynamoDB and S3, and documented for the GitHub Finish-Up-A-Thon Challenge.

Live API health endpoint:

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/health
```

Live books endpoint:

```text
http://booknook-api-prod.eba-mhycv2pm.us-east-1.elasticbeanstalk.com/api/books
```

Live uploaded cover image:

```text
https://booknook-covers-abuwa-2026.s3.us-east-1.amazonaws.com/covers/book-4cdfa13c-26a8-4882-906a-4f8302fbfe88.jpg
```
