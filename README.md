# Student Results Portal

A full-stack web application for importing, validating, analyzing, and viewing student term results from raw CSV files. Built as the take-home assignment for **Es Magico (Full-stack Intern)**.

---

## Features

- **Robust CSV Import Pipeline (`/import`)**:
  - Drag-and-drop or file picker with instant file preview.
  - Streaming CSV parser (`csv-parse`) handling UTF-8 with/without BOM, Windows CRLF and UNIX LF line endings, quoted fields containing commas, and flexible column ordering.
  - In-file duplicate ID detection (first occurrence claims ID; later rows rejected with `DUPLICATE_ID`).
  - Strict row validation collecting all problem entries per row while counting the row once as rejected.
  - Batched MongoDB `bulkWrite` upserts (`ordered: false`) ensuring idempotent re-imports.
  - Summary metrics cards (rows read, imported with new/updated breakdown, rejected).
  - Paginated problems table (showing first 50 problems with plain-English messages and line numbers).
  - One-click downloadable `errors.csv` error report with spreadsheet formula injection protection.
  
- **Searchable Students Directory (`/students`)**:
  - Server-side search by student name or student ID with 300ms debounce.
  - Grade level filter dropdown (Grades 1–12).
  - Responsive table showing student ID, full name, class & section, total score, percentage, color-coded grade pill (A–F), and Pass/Fail status.
  - Server-side pagination with configurable page sizes (10, 25, 50, 100 rows per page) and URL query state synchronization (`?search=...&grade=...&page=...&limit=...`).
  - Polished loading skeletons, empty search state with clear filters button, and error retry state.

- **Individual Student Report Card (`/students/:id`)**:
  - Comprehensive student profile with 2-letter initials avatar and demographic details.
  - Overall performance banner showing total score, percentage, letter grade, and PASS/FAIL badge.
  - Subject-by-subject score breakdown with interactive visual progress bars (0–100%) and individual subject pass indicators.
  - Dedicated `@media print` stylesheet formatted for A4 printing (clean typography, no UI chrome, background fills preserved with `-webkit-print-color-adjust: exact`).
  - Friendly 404 "Student not found" page with direct navigation back to directory.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** MongoDB Atlas via the official `mongodb` Node.js driver (no ORM/ODM bloat, zero docker-compose requirement)
- **CSV Engine:** `csv-parse` with stream info line tracking
- **Styling:** Tailwind CSS with custom print utilities
- **Testing:** Vitest + `mongodb-memory-server` (pure validation logic, fast isolated tests that never touch Atlas)

---

## Prerequisites

1. **Node.js**: v20+ or v22+ (tested on Node v22/v24).
2. **MongoDB Atlas URI**:
   - A MongoDB Atlas connection string (e.g. `mongodb+srv://<username>:<password>@cluster.mongodb.net/student_portal?retryWrites=true&w=majority`).
   - > [!IMPORTANT]
   - > **Atlas IP Access List:** Ensure your IP address is whitelisted in MongoDB Atlas under **Network Access** (or add `0.0.0.0/0` for temporary evaluation access).

---

## Quick Start (Run Locally)

### 1. Clone & Install
```bash
git clone https://github.com/Shauryakant/Student-Results-Portal.git
cd Student-Results-Portal
npm install
```

### 2. Configure Environment
Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
Edit `.env` to include your MongoDB Atlas URI:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/student_portal?retryWrites=true&w=majority
MONGODB_DB=student_portal
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser. (The app is served on **port 8080**).

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## Seeding Data

A deterministic seed generator is included to generate realistic, messy student CSV data and load it directly into MongoDB.

```bash
# Generate seed file and import into MongoDB Atlas
npm run seed

# Custom row count and random seed:
npm run seed -- --count 300 --seed 99

# Generate CSV on disk only (without loading to database):
npm run seed -- --generate-only --out students_seed.csv
```

The seed generator simulates every real-world mess case handled by the portal:
- Normalization (lowercase IDs, mixed date formats `DD/MM/YYYY` vs `YYYY-MM-DD`, extra whitespace, uppercase emails)
- Unicode names (`Müller Patel`, `Amélie Rao`) and quoted names with commas (`"Patel, Sahil"`)
- Edge anomalies (duplicate IDs, wrong column counts, out-of-range marks, negative numbers, missing required fields)

---

## Running Tests

All business logic and validation functions are pure and run without a database. Integration and pipeline tests spin up an ephemeral in-memory MongoDB instance (`mongodb-memory-server`), ensuring tests run fast and never touch your remote Atlas database.

```bash
# Run the complete test suite
npm test

# Run tests in watch mode
npx vitest

# Run a specific test suite
npx vitest run tests/goldenImport.test.ts
```

### Golden Benchmark Verification
The test suite verifies against the project's golden benchmarks:
- **`students_small.csv`** (25 rows): exactly **16 imported / 9 rejected**.
- **`students_sample.csv`** (5,000 rows): exactly **4,685 imported / 315 rejected**, producing exactly **348 problem entries**.
- **Re-upload Idempotency**: Re-importing `students_sample.csv` produces **4,685 imported (0 new, 4,685 updated)** with zero duplicates.

---

## Running with Docker

The application includes a production-grade multi-stage `Dockerfile` running as a non-root user (`nextjs:nodejs`) on port **8080**.

### 1. Build the Docker Image
```bash
docker build -t student-results-portal .
```

### 2. Run the Container
Pass your `MONGODB_URI` securely at runtime via `-e`:
```bash
docker run -p 8080:8080 -e MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/student_portal?retryWrites=true&w=majority" student-results-portal
```

Access the portal at [http://localhost:8080](http://localhost:8080).

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/imports` | Multipart upload (5MB max). Validates, upserts students, records import run, returns summary + first 50 problems. |
| `GET` | `/api/imports/:id/errors.csv` | Downloads CSV of all rejected row problems for an import with formula injection prevention (`=, +, -, @` prefixed with `'`). |
| `GET` | `/api/students?search=&grade=&page=&limit=` | Server-side paginated list of students with name/ID search, class filter, and stable sorting. |
| `GET` | `/api/students/:id` | Returns single student record with computed grading breakdown (`PASS`/`FAIL`, percentage, letter grade). Returns 404 JSON if not found. |

---

## License

MIT © 2026 Shauryakant
