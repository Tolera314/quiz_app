# Quiz Application API Documentation

This document outlines all the web services, API endpoints, methods, and their descriptions for the Quiz Application backend.

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)
**File:** `backend/src/routes/auth.js`

| Method | Endpoint | Description | Location in Controller |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user (Student or Admin). | `authController.js` -> `register` |
| POST | `/login` | Authenticate a user and return a JWT token. | `authController.js` -> `login` |

---

## 2. Quizzes (`/api/quizzes`)
**File:** `backend/src/routes/quiz.js`

| Method | Endpoint | Description | Location in Controller |
| :--- | :--- | :--- | :--- |
| GET | `/` | Fetch all available quizzes. | `quizController.js` -> `getQuizzes` |
| GET | `/:id` | Fetch a specific quiz by ID (includes randomized questions/options). | `quizController.js` -> `getQuizById` |
| GET | `/:id/leaderboard` | Get the top 10 scores for a specific quiz. | `quizController.js` -> `getLeaderboard` |
| POST | `/` | **(Admin Only)** Create a new quiz. | `quizController.js` -> `createQuiz` |
| PUT | `/:id` | **(Admin Only)** Update quiz details (title, description, etc.). | `quizController.js` -> `updateQuiz` |
| DELETE | `/:id` | **(Admin Only)** Delete a quiz and its related questions. | `quizController.js` -> `deleteQuiz` |
| POST | `/questions` | **(Admin Only)** Add multiple questions to a quiz. | `quizController.js` -> `addQuestions` |

---

## 3. Attempts & Results (`/api/attempts`)
**File:** `backend/src/routes/attempt.js`

| Method | Endpoint | Description | Location in Controller |
| :--- | :--- | :--- | :--- |
| GET | `/latest-unfinished` | Get the user's most recent active (not submitted) attempt. | `attemptController.js` -> `getLatestUnfinished` |
| POST | `/start` | Record the start of a quiz attempt. | `attemptController.js` -> `startAttempt` |
| POST | `/save-answer` | Save/update a single answer during a quiz attempt (Silent Sync). | `attemptController.js` -> `saveAnswer` |
| POST | `/submit` | Finalize a quiz attempt and calculate the score. | `attemptController.js` -> `submitAttempt` |
| GET | `/history` | Get the logged-in user's quiz attempt history. | `attemptController.js` -> `getHistory` |
| GET | `/:id` | Get detailed results for a specific attempt. | `attemptController.js` -> `getAttemptResult` |

---

## 4. Admin Management (`/api/admin`)
**File:** `backend/src/routes/admin.js`

| Method | Endpoint | Description | Location in Controller |
| :--- | :--- | :--- | :--- |
| GET | `/stats` | Get overview statistics (Total users, quizzes, attempts). | `adminController.js` -> `getStats` |
| GET | `/quizzes/:id/analytics` | Get detailed analytics for a specific quiz (Avg score, highest score). | `adminController.js` -> `getQuizAnalytics` |
| PUT | `/questions/:id` | Update a specific question and its options. | `adminController.js` -> `updateQuestion` |
| DELETE | `/questions/:id` | Delete a specific question. | `adminController.js` -> `deleteQuestion` |
| POST | `/quizzes/:id/bulk-questions` | Bulk upload multiple questions via JSON. | `adminController.js` -> `bulkUploadQuestions` |
| POST | `/quizzes/:id/questions` | Create a single question for a specific quiz. | `adminController.js` -> `createQuestion` |

---

## 5. Health Check
| Method | Endpoint | Description | Location |
| :--- | :--- | :--- | :--- |
| GET | `/health` | Verify if the backend service is running. | `server.js` |
