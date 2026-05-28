# BookNook Personal Reading Tracker API

BookNook is a Node.js and Express REST API for tracking personal reading lists.

## Features

- Health check endpoint
- Add books
- List all books
- Filter books by status
- Get a single book
- Update book status, rating, and notes
- Delete books
- Upload book cover images

## Technology Stack

- Node.js
- Express.js
- Azure App Service
- Azure SQL Database
- Azure Blob Storage
- Azure Key Vault
- Managed Identity
- GitHub Actions

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health check |
| GET | /api/books | List all books |
| POST | /api/books | Add a new book |
| GET | /api/books/:id | Get a single book |
| PUT | /api/books/:id | Update a book |
| DELETE | /api/books/:id | Delete a book |
| POST | /api/books/:id/cover | Upload book cover image |

## Local Development

Install dependencies:

npm install

Run development server:

npm run dev
