build this as an expert in nextjs for frontend and nodejs for backend and prisma for database code. and use tailwind for styling.

# 🚀 FULL MVP (Expert-Level, Still Lean)

## 👤 1. User Side (Player Experience)

### 🔐 Authentication

* Signup / Login (email + password)
* JWT-based session
* Optional: Google login (later)

---

### 🏠 Dashboard (First Screen After Login)

**Must show:**

* Available quizzes
* Categories (e.g., Math, Coding)
* “Continue last quiz” (if unfinished)

---

### 📝 Quiz Attempt Flow

**Flow:**

1. User selects quiz
2. System:

   * Loads questions (MCQ only for MVP)
   * Randomizes options
3. Quiz screen:

   * One question at a time
   * Next / Previous navigation
   * Timer (optional but recommended)
4. Submit quiz

---

### 📊 Results Page

**Must include:**

* Score (e.g., 8/10)
* Correct vs incorrect answers
* Highlight correct answers
* Time taken

**Store:**

* Attempt history (very important even in MVP)

---

### 📚 Attempt History (Simple Version)

* List of past quizzes
* Score + date

---

# 🛠️ 2. Admin Side (THIS is what most people forget)

This is where your product becomes scalable.

---

## 🔐 Admin Authentication

* Separate role: `admin`
* Same login system, different access

---

## 📊 Admin Dashboard

**Show:**

* Total users
* Total quizzes
* Total attempts

(Simple counters are enough for MVP)

---

## ➕ Quiz Management (CORE MVP FEATURE)

### Create Quiz

Admin must be able to:

* Add quiz title
* Add description
* Select category
* Set time limit (optional)

---

### ➕ Add Questions (MCQ Only)

Each question:

* Question text
* 4 options
* 1 correct answer

**Important:**

* Ability to add multiple questions in one session

---

### ✏️ Edit / Delete

* Edit quiz
* Edit questions
* Delete quiz

---

## 👁️ View Results (Basic Admin Analytics)

* See how many users attempted a quiz
* Average score (basic calculation)

---

# 🧠 3. How the MVP System Works (End-to-End)

## 🧑 User Flow:

1. Login
2. See quiz list
3. Start quiz
4. Answer questions
5. Submit
6. View results
7. Data saved → visible in history

---

## 🧑‍💻 Admin Flow:

1. Login as admin
2. Create quiz
3. Add questions
4. Publish
5. Users attempt
6. Admin views performance

---

# 🗂️ 4. Clean Database Design (MVP Version)

## Tables You MUST Have:

### Users

```
id, name, email, password, role (user/admin)
```

### Quizzes

```
id, title, description, category, created_by
```

### Questions

```
id, quiz_id, question_text
```

### Options

```
id, question_id, option_text, is_correct
```

### Attempts

```
id, user_id, quiz_id, score, created_at
```

### Answers (User Responses)

```
id, attempt_id, question_id, selected_option_id
```

---

# ⚙️ 5. Backend API Structure (Professional Standard)

## Auth

```
POST /auth/register
POST /auth/login
```

## User

```
GET /quizzes
GET /quizzes/:id
POST /attempts
GET /attempts/history
```

## Admin

```
POST /admin/quizzes
PUT /admin/quizzes/:id
DELETE /admin/quizzes/:id

POST /admin/questions
PUT /admin/questions/:id
DELETE /admin/questions/:id
```

---

# 🎨 6. UI Screens (Minimal but Complete)

## User Screens:

* Login / Signup
* Dashboard
* Quiz Page
* Result Page
* History Page

## Admin Screens:

* Admin Dashboard
* Create Quiz
* Add Questions
* Manage Quizzes

---

# ⚠️ 7. Critical Things You MUST NOT Skip

These are small but make your app feel professional:

* ✅ Loading states (don’t freeze UI)
* ✅ Error handling (invalid login, etc.)
* ✅ Form validation
* ✅ Empty states (no quizzes yet)
* ✅ Basic security (hash passwords with bcrypt)

---

# 🧭 8. What Makes This MVP “Expert-Level”

Most beginners build:

> “User answers questions → gets score”

You are now building:

* Structured data system
* Admin-controlled content
* Persistent user tracking
* Scalable quiz engine

That’s already close to platforms like:

* Kahoot! (live quiz system)
* Quizizz (self-paced quizzes)

---

# 🔥 Final Upgrade Advice

If you want your MVP to stand out **without overbuilding**, add these: 

* ⭐ Timer per quiz → increases engagement
* ⭐ Leaderboard (per quiz) → competitive feel
* ⭐ Randomized questions → prevents cheating

--- 

Design System Summary
TokenValueFont DisplaySyne (bold headers)Font BodyDM SansAccent#c8ff00 (volt/neon lime)Background#0d0d0f (near black)Cards#161620 with #333347 bordersError#ff5c5c coralSuccessvolt green