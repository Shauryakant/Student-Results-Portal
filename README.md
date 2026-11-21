# 🎓 Student Results Portal

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas_v6-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-yellow?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker)](https://www.docker.com/)

A full-stack web application for importing, validating, analyzing, and viewing student term results from raw CSV files. Built as the take-home assignment for **Es Magico (Full-stack Intern)**.

---

## 🎥 Video Demo & Walkthrough

[![Watch the Demo Video](https://img.shields.io/badge/YouTube-Watch%20Demo%20Video-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=YOUR_DEMO_VIDEO_ID)

> 📺 **Demo Walkthrough Video Link:** [**Click here to watch the full demo on YouTube**](https://www.youtube.com/watch?v=YOUR_DEMO_VIDEO_ID)  
> *(Paste your YouTube demo recording link here)*  
>
> **What's covered in the video:**
> 1. **CSV Upload & Ingestion (`/import`):** Drag-and-drop, real-time validation, duplicate ID handling, summary metric cards, and downloadable `errors.csv` with formula injection prevention.
> 2. **Students Directory (`/students`):** Debounced search across names and IDs, class filter dropdown, server-side pagination, loading skeletons, and empty/retry states.
> 3. **Student Scorecard & Report (`/students/:id`):** Computed percentage, letter grades (A–F), subject-by-subject visual score bars, pass/fail status, and dedicated A4 print preview.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Business Rules & Validation Engine](#-business-rules--validation-engine)
- [Golden Benchmark Verification](#-golden-benchmark-verification)
- [Prerequisites](#-prerequisites)
- [Local Setup & Development](#-local-setup--development)
- [Deterministic Seeding (`npm run seed`)](#-deterministic-seeding-npm-run-seed)
- [Running Test Suite](#-running-test-suite)
- [Production Docker Deployment](#-production-docker-deployment)
- [API Reference](#-api-reference)
- [Directory Structure](#-directory-structure)

---

## 🚀 Key Features

### 1. Robust CSV Ingestion (`/import`)
- **Fault-Tolerant Streaming Parser:** Powered by `csv-parse` with `bom: true` and `relax_column_count: true`. Supports UTF-8 with/without BOM, Windows CRLF and UNIX LF line endings, quoted fields containing commas, and unordered/case-insensitive header columns.
- **Accurate Physical Line Number Tracking:** Tracks true line numbers in the uploaded file via `info.lines`, accurately counting blank rows without corrupting line indices.
- **Strict In-File Duplicate Checking:** First occurrence of an ID claims the slot; all subsequent rows with that ID are rejected with `DUPLICATE_ID`.
- **Comprehensive Problem Reporting:** Rows with multiple errors report every problematic field individually while counting as a single rejected row.
- **Batched Atomic Upserts:** Uses MongoDB `bulkWrite` with `upsert: true` in batches of 1,000 records. Repeated imports are 100% idempotent.
- **Spreadsheet Formula Injection Defense:** Cells in `errors.csv` beginning with `=`, `+`, `-`, or `@` are safely prefixed with `'` to prevent malicious formula execution in Excel and Google Sheets.

### 2. Searchable Students Directory (`/students`)
- **Server-Side Search & Filtering:** Case-insensitive search by student name or student ID with 300ms debounce.
- **Grade Level Filter:** Quick filtering by Grade 1 through 12.
- **URL Query State Sync:** Search parameters (`?search=...&grade=...&page=...&limit=...`) sync with browser history for shareable bookmarks.
- **Responsive Table & Pagination:** Configurable page size (10, 25, 50, 100) with jump-to-first/last controls.
- **Resilient UI States:** Pulsing loading skeletons, empty state with "Clear search", and error state with retry.

### 3. Student Report Card (`/students/:id`)
- **Student Profile:** Two-letter initials avatar, uppercase ID badge, class, section, email, and formatted DOB.
- **Overall Grade Banner:** Total score (`/ 500`), percentage, letter grade (A, B, C, D, F), and overall PASS/FAIL badge.
- **Subject Score Breakdown:** Visual progress bars color-coded by performance thresholds with individual subject pass/fail badges.
- **A4 Print Mode:** Custom `@media print` stylesheet removing headers, buttons, and navigation chrome, while preserving progress bar fills with `-webkit-print-color-adjust: exact`.
- **404 Not Found Page:** Dedicated not-found view for invalid or unimported student IDs.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    User([Browser Client]) -->|Upload CSV| ImportRoute["POST /api/imports"]
    User -->|Query / Filter| StudentsRoute["GET /api/students"]
    User -->|View Report| StudentDetailRoute["GET /api/students/:id"]
    User -->|Download Errors| ErrorsRoute["GET /api/imports/:id/errors.csv"]

    subgraph Validation Engine (Pure Functions)
        ImportRoute --> Parser["csv-parse (info.lines)"]
        Parser --> HeaderValidator["Header Check & Column Normalizer"]
        HeaderValidator --> DupTracker["DuplicateTracker (First-seen wins)"]
        DupTracker --> RowValidator["Row Validator (9 Field Validators)"]
        RowValidator --> GradingEngine["Grading & Pass/Fail Calculator"]
    end

    subgraph Database Layer
        GradingEngine --> BulkWrite["MongoDB bulkWrite (Batches of 1,000)"]
        BulkWrite --> MongoStudents[("students collection (Unique student_id)")]
        GradingEngine --> MongoImports[("imports collection")]
    end
```

---

## 📋 Business Rules & Validation Engine

### Field Validation Rules

| Field | Required | Format / Constraints | Normalization / Storage |
|---|---|---|---|
| `student_id` | Yes | 3–20 alphanumeric chars + hyphens | Trimmed, stored **UPPERCASE**. Duplicate in file $\rightarrow$ `DUPLICATE_ID`. |
| `full_name` | Yes | 2–100 chars, Unicode letters (`\p{L}`), spaces, `'`, `,`, `-`, `.` | Trimmed, repeated spaces collapsed, `name_search` stored in lowercase. |
| `email` | Yes | Valid RFC 5322 email with domain & TLD | Trimmed, stored **lowercase**. |
| `date_of_birth` | Yes | `YYYY-MM-DD` or `DD/MM/YYYY`, valid calendar date, age 5–25 | Parsed to UTC `Date`. Injectable `today` parameter. |
| `grade_level` | Yes | Whole number 1–12 (`"09"` permitted) | Stored as integer (1–12). |
| `section` | Yes | Single letter A–F | Stored **UPPERCASE** (A–F). |
| `maths`, `science`, `english`, `social_studies`, `second_language` | Yes | Number 0–100, decimals allowed | Stored as numeric values (0–100). |

### Error Codes
- `MISSING_REQUIRED`: Required field is absent, empty, or whitespace-only.
- `INVALID_FORMAT`: Value fails format rules (e.g. malformed email, text date, roman numeral grade).
- `OUT_OF_RANGE`: Number outside 0–100, age outside 5–25, or grade outside 1–12.
- `DUPLICATE_ID`: Student ID already appeared in an earlier row of the same file.
- `WRONG_FIELD_COUNT`: Row has too few or too many columns compared to header.

### Grading Scheme
- **Percentage Formula:** `percentage = (total_marks / 500) * 100`. Stored as exact float, rounded to 1 decimal place (`XX.X%`) for display.
- **Grade Bands:**
  - `A`: $\ge 80\%$
  - `B`: $\ge 65\%$ and $< 80\%$
  - `C`: $\ge 50\%$ and $< 65\%$
  - `D`: $\ge 35\%$ and $< 50\%$
  - `F`: $< 35\%$
- **Pass / Fail Criteria:** Student passes (`PASS`) if and only if **overall percentage $\ge 35\%$** AND **each individual subject mark $\ge 33$**. Failing even one subject triggers overall `FAIL`.

---

## 🎯 Golden Benchmark Verification

The validation and import pipeline is verified against the sample pack:

| Benchmark File | Total Rows | Expected Imported | Expected Rejected | Total Problem Entries |
|---|---|---|---|---|
| `students_small.csv` | 25 | **16** | **9** | 9 |
| `students_sample.csv` | 5,000 | **4,685** | **315** | **348** |
| Re-upload Idempotency | 5,000 | **4,685** (0 new, 4,685 updated) | **315** | 348 |

---

## ⚙ Prerequisites

1. **Node.js**: v20+ or v22+ (tested on Node v22 and v24).
2. **MongoDB Atlas URI**:
   - Connection string in format: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
   - > [!IMPORTANT]
   - > **Atlas Network Access:** Ensure your current IP is whitelisted under **Network Access** in the MongoDB Atlas dashboard (or allow `0.0.0.0/0` for testing).

---

## 💻 Local Setup & Development

### 1. Clone & Install
```bash
git clone https://github.com/Shauryakant/Student-Results-Portal.git
cd Student-Results-Portal
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student_portal?retryWrites=true&w=majority
MONGODB_DB=student_portal
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) (configured to run on **port 8080**).

### 4. Build & Run for Production
```bash
npm run build
npm start
```

---

## 🎲 Deterministic Seeding (`npm run seed`)

A deterministic seeded data generator creates realistic student CSV files containing every kind of edge case and anomaly handled by the portal.

```bash
# Generate seed file and import directly into MongoDB Atlas
npm run seed

# Custom row count and seed
npm run seed -- --count 300 --seed 99

# Generate CSV on disk only (skips database connection)
npm run seed -- --generate-only --out custom_seed.csv
```

---

## 🧪 Running Test Suite

All validation logic uses pure functions with zero I/O. Integration tests execute against an isolated in-memory MongoDB instance (`mongodb-memory-server`), ensuring tests are fast and never touch your production database.

```bash
# Run all tests once
npm test

# Run tests in interactive watch mode
npx vitest

# Run a specific test suite
npx vitest run tests/goldenImport.test.ts
npx vitest run tests/ui/
npx vitest run tests/api/
```

---

## 🐳 Production Docker Deployment

The application includes a production-ready, multi-stage Alpine `Dockerfile` running as a non-root user (`nextjs:nodejs`, UID 1001) on port **8080**.

### 1. Build the Docker Image
```bash
docker build -t student-results-portal .
```

### 2. Run the Container
Pass your `MONGODB_URI` securely at runtime via `-e`:
```bash
docker run -p 8080:8080 -e MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/student_portal?retryWrites=true&w=majority" student-results-portal
```
Visit [http://localhost:8080](http://localhost:8080).

---

## 📡 API Reference

### 1. Ingest CSV File
`POST /api/imports`
- **Content-Type:** `multipart/form-data` (file parameter: `file`)
- **Limit:** 5 MB max
- **Response (200 OK):**
```json
{
  "importId": "65b...",
  "filename": "students.csv",
  "rowsRead": 5000,
  "imported": 4685,
  "newCount": 4685,
  "updatedCount": 0,
  "rejected": 315,
  "problemsCount": 348,
  "problems": [
    {
      "row": 14,
      "student_id": "STU00012",
      "field": "email",
      "code": "INVALID_FORMAT",
      "message": "Invalid email address format"
    }
  ]
}
```

### 2. Download Validation Error Report
`GET /api/imports/:id/errors.csv`
- **Response:** Downloadable CSV file containing columns: `Line,Student ID,Field,Error Code,Problem Description`.
- **Security:** Formula injection characters (`=, +, -, @`) prefixed with `'`.

### 3. List Students
`GET /api/students?search=aarav&grade=9&page=1&limit=25`
- **Response (200 OK):**
```json
{
  "students": [
    {
      "student_id": "STU00001",
      "full_name": "Aarav Sharma",
      "grade_level": 9,
      "section": "B",
      "total": 392,
      "percentage": 78.4,
      "percentage_display": "78.4%",
      "grade": "B"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4. Get Student Detail & Grading Breakdown
`GET /api/students/:id`
- **Response (200 OK):** Student details with computed marks and grading breakdown.
- **Response (404 Not Found):** `{ "error": "Student with ID \"...\" not found" }`

---

## 📁 Directory Structure

```
.
├── scripts/
│   ├── seed.ts                     # npm run seed runner
│   └── seed-generator.ts           # CLI generator wrapper
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── imports/            # POST /api/imports, GET /api/imports/:id/errors.csv
│   │   │   └── students/           # GET /api/students, GET /api/students/:id
│   │   ├── import/page.tsx         # /import screen
│   │   ├── students/
│   │   │   ├── page.tsx            # /students screen
│   │   │   └── [id]/page.tsx       # /students/:id scorecard & not-found.tsx
│   │   ├── globals.css             # Tailwind + @media print styles
│   │   └── layout.tsx              # Root shell with Navbar
│   ├── components/                 # Dropzone, SummaryCards, ProblemsTable, StudentTable, ReportView
│   └── lib/
│       ├── db/mongodb.ts           # Cached MongoDB client helper
│       ├── import/                 # CSV parsing, header validation, duplicate tracking, bulk upsert
│       ├── seed/seedGenerator.ts   # Deterministic data generator
│       └── validation/             # Pure field and row validators, grading scheme
├── tests/                          # 29 test suites (155 tests) with mongodb-memory-server
├── Dockerfile                      # Multi-stage production container (port 8080, non-root)
├── NOTES.md                        # Architectural decisions & trade-offs (1 page)
└── README.md                       # Complete documentation & video demo link
```

---

## 📄 License

MIT © 2026 Shauryakant
