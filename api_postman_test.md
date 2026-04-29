# Quizio API Documentation (Postman Test Guide)

This document outlines the four primary CRUD methods for managing quizzes in the Quizio platform, including the new **Trivia API** integration.

---

## 🚀 Trivia API Test Example
You can test the external Trivia API integration directly via the backend proxy:
- **Endpoint**: `GET /api/quizapi/questions`
- **Params**: `limit=5`, `categories=science`, `difficulty=medium`
- **Auth**: Bearer Token required.

---

## 🛠 Quiz Management Methods

### 1. GET — Retrieve All Quizzes
Fetches a list of all quizzes currently in the local database.
- **Endpoint**: `GET http://localhost:5000/api/quizzes`
- **Auth**: Bearer Token required.
- **Success Response**: `200 OK`
```json
[
  {
    "id": "cmojx0ypl000f6oggpbwu7k3x",
    "title": "SQL Mastery",
    "category": "Database",
    "questionCount": 10
  }
]
```

### 2. POST — Import Quiz from Trivia API
Creates a new quiz in the local database by pulling questions from the Trivia API.
- **Endpoint**: `POST http://localhost:5000/api/quizapi/import`
- **Auth**: Bearer Token (Admin only)
- **Body (JSON)**:
```json
{
  "title": "Science Mega Quiz",
  "description": "A quiz about physics, biology, and chemistry.",
  "categories": "science",
  "difficulty": "medium",
  "limit": 10,
  "timeLimit": 600
}
```

### 3. PUT — Update Existing Quiz
Updates the metadata (title, description, etc.) of an existing quiz.
- **Endpoint**: `PUT http://localhost:5000/api/quizzes/:id`
- **Auth**: Bearer Token (Admin only)
- **Body (JSON)**:
```json
{
  "title": "Science Mega Quiz v2",
  "description": "Updated description with more details.",
  "timeLimit": 900
}
```

### 4. DELETE — Remove Quiz
Permanently deletes a quiz and all its associated questions/options.
- **Endpoint**: `DELETE http://localhost:5000/api/quizzes/:id`
- **Auth**: Bearer Token (Admin only)
- **Success Response**: `200 OK`
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

---

## 🔍 Implementation Details
- **Controller**: `backend/src/controllers/quizApiController.js` handles external Trivia API requests.
- **Logic**: Questions are fetched from `https://the-trivia-api.com/api/questions`, normalized to our internal schema, and options are shuffled before being saved to the database.
- **Auth**: All routes are protected by `authMiddleware`. Admin routes also use `adminMiddleware`.
