# Postman API Testing Guide

## Common Headers (All Requests)
| Header         | Value         | Notes                              |
|----------------|---------------|------------------------------------|
| `user-id`      | `1`           | Simulates logged-in user (no JWT)  |
| `role`         | `admin`       | Use `user` for non-admin endpoints |
| `Content-Type` | `application/json` | Required for POST/PUT requests |

---

## 1. Auth Endpoints (`/api/auth`)

### POST – Register
**URL:** `POST http://localhost:5000/api/auth/register`
```json
{
  "name": "Test Admin",
  "email": "admin@quiz.com",
  "password": "password123",
  "role": "admin"
}
```

### POST – Login
**URL:** `POST http://localhost:5000/api/auth/login`
```json
{
  "email": "admin@quiz.com",
  "password": "password123"
}
```

---

## 2. Quiz Endpoints (`/api/quizzes`)

### POST – Create Quiz
**URL:** `POST http://localhost:5000/api/quizzes`
**Headers:** `role: admin`
```json
{
  "title": "JavaScript Fundamentals",
  "description": "Core JS concepts test",
  "category": "Programming",
  "timeLimit": 600
}
```

### GET – Get All Quizzes
**URL:** `GET http://localhost:5000/api/quizzes`
No body required.

### GET – Get Quiz By ID
**URL:** `GET http://localhost:5000/api/quizzes/<QUIZ_ID>`
No body required.

### PUT – Update Quiz
**URL:** `PUT http://localhost:5000/api/quizzes/<QUIZ_ID>`
**Headers:** `role: admin`
```json
{
  "title": "Advanced JavaScript",
  "description": "Updated description",
  "category": "Programming",
  "timeLimit": 900
}
```

### DELETE – Delete Quiz
**URL:** `DELETE http://localhost:5000/api/quizzes/<QUIZ_ID>`
**Headers:** `role: admin`
No body required.

---

## 3. QuizAPI.io Integration (`/api/quizapi`)

### GET – Browse Questions (from QuizAPI.io, NOT saved to DB)
**URL:** `GET http://localhost:5000/api/quizapi/questions`

**Query Parameters (all optional):**
| Param        | Example values                          |
|--------------|-----------------------------------------|
| `category`   | `Linux`, `Docker`, `SQL`, `JavaScript`  |
| `difficulty` | `easy`, `medium`, `hard`                |
| `tags`       | `php`, `javascript`, `python`           |
| `limit`      | `5` to `20`                             |

**Example URL:**
```
GET http://localhost:5000/api/quizapi/questions?category=Linux&difficulty=easy&limit=5
```

---

### GET – Fetch All Categories
**URL:** `GET http://localhost:5000/api/quizapi/categories`
No body required.

---

### GET – Fetch All Tags
**URL:** `GET http://localhost:5000/api/quizapi/tags`
No body required.

---

### POST – Import New Quiz from QuizAPI.io (SAVES to DB)
Fetches questions from QuizAPI.io and creates a **brand-new quiz** in your local database.

**URL:** `POST http://localhost:5000/api/quizapi/import`
**Headers:** `role: admin`
```json
{
  "title": "Linux Basics Quiz",
  "description": "Auto-imported from QuizAPI.io",
  "category": "Linux",
  "difficulty": "easy",
  "limit": 10,
  "timeLimit": 600
}
```

**Optional body fields:**
| Field         | Description                                   | Default  |
|---------------|-----------------------------------------------|----------|
| `title`       | Quiz title (**required**)                     | —        |
| `description` | Quiz description                              | Auto-generated |
| `category`    | QuizAPI.io category to pull from              | `General` |
| `difficulty`  | `easy` / `medium` / `hard`                   | Any      |
| `tags`        | Tag filter string                             | None     |
| `limit`       | Number of questions (max 20)                  | `10`     |
| `timeLimit`   | Time in seconds for the quiz                  | `600`    |

---

### POST – Append Questions to Existing Quiz (SAVES to DB)
Fetches questions from QuizAPI.io and appends them to an **existing** quiz.

**URL:** `POST http://localhost:5000/api/quizapi/import-questions/<QUIZ_ID>`
**Headers:** `role: admin`
```json
{
  "category": "Docker",
  "difficulty": "medium",
  "limit": 5
}
```

---

## 4. Admin Endpoints (`/api/admin`)

### GET – Dashboard Stats
**URL:** `GET http://localhost:5000/api/admin/stats`
**Headers:** `role: admin`

### GET – All Users
**URL:** `GET http://localhost:5000/api/admin/users`
**Headers:** `role: admin`

### GET – Quiz Analytics
**URL:** `GET http://localhost:5000/api/admin/quizzes/<QUIZ_ID>/analytics`
**Headers:** `role: admin`

### PUT – Update Question
**URL:** `PUT http://localhost:5000/api/admin/questions/<QUESTION_ID>`
**Headers:** `role: admin`
```json
{
  "questionText": "Updated question text?"
}
```

### DELETE – Delete Question
**URL:** `DELETE http://localhost:5000/api/admin/questions/<QUESTION_ID>`
**Headers:** `role: admin`

---

## 5. Attempt Endpoints (`/api/attempts`)

### POST – Start Attempt
**URL:** `POST http://localhost:5000/api/attempts/start`
```json
{
  "quizId": "<QUIZ_ID>"
}
```

### POST – Save Answer
**URL:** `POST http://localhost:5000/api/attempts/save-answer`
```json
{
  "attemptId": "<ATTEMPT_ID>",
  "questionId": "<QUESTION_ID>",
  "selectedOptionId": "<OPTION_ID>"
}
```

### POST – Submit Attempt
**URL:** `POST http://localhost:5000/api/attempts/submit`
```json
{
  "attemptId": "<ATTEMPT_ID>"
}
```

### GET – History
**URL:** `GET http://localhost:5000/api/attempts/history`

### GET – Attempt Result
**URL:** `GET http://localhost:5000/api/attempts/<ATTEMPT_ID>`