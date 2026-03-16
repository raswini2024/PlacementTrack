# 🎯 PlacementTrack — Full Stack Placement Preparation Platform

A complete full-stack web application to help students prepare for company placements step-by-step.

---

## 📁 Project Structure

```
PlacementTrack/
├── backend/          ← Spring Boot Java application
├── frontend/         ← React JS application
└── database/         ← MySQL schema and seed data
```

---

## 🛠️ Tech Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Frontend | React 18, React Router v6, Axios, Recharts |
| Backend  | Java 17, Spring Boot 3.2, Spring Security, JWT |
| Database | MySQL 8+                              |
| Auth     | JWT Tokens (Bearer)                   |
| ORM      | Spring Data JPA / Hibernate           |

---

## ⚙️ Prerequisites

Make sure the following are installed:

- **Java 17+** — [Download](https://adoptium.net/)
- **Maven 3.8+** — [Download](https://maven.apache.org/download.cgi)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **MySQL 8+** — [Download](https://dev.mysql.com/downloads/)

---

## 🗄️ Step 1: Setup Database

1. Open MySQL Workbench or MySQL CLI.
2. Run the schema file:
   ```sql
   source /path/to/PlacementTrack/database/schema.sql
   ```
   OR copy-paste the file contents into your MySQL client.

3. This will:
   - Create the `placement_track` database
   - Create all tables
   - Insert seed data (topics, subtopics, questions, HR questions, company questions)

4. Update credentials if needed in:
   ```
   backend/src/main/resources/application.properties
   ```
   ```properties
   spring.datasource.username=root
   spring.datasource.password=root   ← Change to your MySQL password
   ```

---

## 🚀 Step 2: Run the Backend (Spring Boot)

```bash
cd PlacementTrack/backend
mvn clean install
mvn spring-boot:run
```

The backend will start at: **http://localhost:8080**

> ⚠️ Make sure MySQL is running before starting the backend.

---

## 🌐 Step 3: Run the Frontend (React)

Open a new terminal:

```bash
cd PlacementTrack/frontend
npm install
npm start
```

The frontend will open at: **http://localhost:3000**

---

## 🔑 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Login and get JWT token |

### Student (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/me` | Get current user info |
| POST | `/api/student/profile` | Save student profile |
| GET | `/api/student/profile` | Get student profile |
| GET | `/api/student/progress` | Get overall progress |
| GET | `/api/student/suggestions` | Get smart suggestions |

### Questions (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/questions/topics/{moduleType}` | Get topics by module |
| GET | `/api/questions/subtopics/{topicId}` | Get subtopics |
| GET | `/api/questions/practice/{subtopicId}` | Get practice questions |
| POST | `/api/questions/submit` | Submit an answer |
| GET | `/api/questions/progress/{subtopicId}` | Get subtopic progress |

### Interview (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interview/company/{company}` | Company questions |
| GET | `/api/interview/company/{company}/roadmap` | Company roadmap |
| GET | `/api/interview/hr-questions` | HR interview questions |
| GET | `/api/interview/mock-test/start/{testType}` | Start mock test |
| POST | `/api/interview/mock-test/submit` | Submit mock test |
| GET | `/api/interview/mock-test/history` | Test history |

---

## 🧩 Features

### Student Journey
1. ✅ Register/Login
2. ✅ Fill Profile (language, dream company, role, skill level)
3. ✅ Land on personalized dashboard
4. ✅ Practice aptitude (Quant, Logical, Verbal) — Indiabix style
5. ✅ Practice programming concepts
6. ✅ Take mock tests (Aptitude/Programming/Mixed)
7. ✅ Prepare for interviews (HR + company roadmaps)
8. ✅ Analyze resume
9. ✅ Track progress → reach 100% → ready for interview! 🎉

### Smart Features
- 📊 **Progress Tracking**: Tracks correct answers, total attempts, accuracy per subtopic
- 💡 **Smart Suggestions**: "You are doing great, move to next level" or "Practice more questions"
- 🎯 **Company Roadmaps**: Zoho, TCS, Amazon, Google — each with staged interview prep
- 🏆 **Completion Message**: Shown when student reaches 100% overall progress

---

## 🗃️ Database Tables

| Table | Description |
|-------|-------------|
| `students` | Student login credentials |
| `student_profiles` | Dream company, role, language, skill level |
| `topics` | Aptitude/Programming/Interview topics |
| `subtopics` | Subtopics within each topic |
| `questions` | MCQ questions with options and answers |
| `student_progress` | Per-student accuracy tracking per subtopic |
| `student_answers` | Answer history |
| `mock_tests` | Mock test results |
| `company_questions` | Previous year company questions |
| `hr_questions` | HR interview questions |

---

## 🐛 Troubleshooting

**CORS Error?**
- Make sure frontend is on port 3000 and backend on port 8080
- Check `SecurityConfig.java` — CORS is set to `http://localhost:3000`

**MySQL Connection Error?**
- Check MySQL is running: `sudo service mysql start`
- Verify credentials in `application.properties`
- Ensure database `placement_track` exists

**JWT Not Working?**
- Clear localStorage in browser DevTools
- Re-login to get a fresh token

---

## 📞 Support

This project is structured for learning and extension. Each module is independent and can be extended easily.
