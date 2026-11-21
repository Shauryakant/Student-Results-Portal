# Architectural Decisions & Technical Notes

### Es Magico — Student Results Portal (Full-stack Intern)

---

## 1. Stack & Why

- **Next.js 15 (App Router, TypeScript):** Unified single-container architecture. Server Components handle direct database access and SSR, route handlers serve clean REST APIs, and client components provide snappy interactivity without boilerplate state managers.
- **MongoDB Atlas via Official `mongodb` Driver:** A document database fits student profiles with nested marks perfectly (`marks: { maths, science, ... }`). Using the native driver eliminates ORM/ODM abstraction overhead and unlocks high-throughput atomic `bulkWrite` upserts.
- **`csv-parse`:** Streaming, RFC 4180-compliant parser capable of handling UTF-8 with/without BOM, Windows CRLF, and quoted fields with embedded commas. Accurate physical line numbers are preserved via `info.lines`.
- **Vitest + `mongodb-memory-server`:** Core validation functions are purely functional (zero I/O), allowing hundreds of unit tests to execute in milliseconds. Ephemeral in-memory MongoDB is used exclusively during integration tests, ensuring tests never hit production Atlas.
- **Tailwind CSS:** Clean, custom design following the assignment wireframes without generic UI library bloat. Includes a dedicated `@media print` stylesheet.

---

## 2. Key Decisions & Rationales

### Duplicate ID Policy (In-File)
- **Decision:** The first occurrence of a `student_id` in a CSV file claims that ID even if that first row itself contains other validation errors and is rejected. Any subsequent row with that same ID is rejected with code `DUPLICATE_ID`.
- **Reasoning:** A duplicated ID represents ambiguous identity. Allowing an erroneous earlier row to forfeit its ID to a later row could lead to incorrect student records being persisted. Furthermore, this policy reproduces the exact benchmark counts: **16 imported / 9 rejected** on `students_small.csv` and **4,685 imported / 315 rejected (348 problem entries)** on `students_sample.csv`.

### Date of Birth Reference Date (`today`)
- **Decision:** Injectable `today` parameter defaulting to `new Date()`.
- **Reasoning:** In `students_sample.csv`, Grade 1 students were born in 2020. Evaluated against 2026, these students are 5–6 years old (valid). If evaluated against 2024, they would be under the minimum age of 5 and rejected. Injecting `today` ensures deterministic testing across arbitrary dates.

### Grading Scheme
- **Formula:** `percentage = (total / 500) * 100`. Stored as full floating-point precision; rounded to 1 decimal place (`XX.X%`) for display only.
- **Grade Bands:** `A >= 80%`, `B >= 65%`, `C >= 50%`, `D >= 35%`, `F < 35%`.
- **Pass / Fail Rule:** A student passes (`PASS`) if and only if **overall percentage >= 35%** AND **each subject score >= 33**. One failing subject results in an overall `FAIL`.

### System Limits & Resilience
- **Max Upload Size:** 5 MB limit enforced at the API route level (~50,000 rows), preventing denial-of-service memory exhaustion.
- **Fault-Tolerant File Handling:** Binary files, empty files, and files missing required headers return user-friendly error responses (HTTP 400) without crashing the process.
- **Formula Injection Defense:** Cells in `errors.csv` starting with `=`, `+`, `-`, or `@` are sanitized with a leading single quote (`'`), neutralizing spreadsheet formula execution attacks.
- **Idempotent Imports:** The `students` collection maintains a unique index on `student_id`. Re-uploading imports runs batched `bulkWrite` with `upsert: true`, accurately categorizing records into `new_count` and `updated_count`.

---

## 3. What's Missing & Known Trade-offs

- **Synchronous In-Request Import:** Uploads are processed within the HTTP request cycle. While 5,000 rows parse and persist in under 1 second, files with > 100,000 rows would benefit from an asynchronous job queue (e.g. BullMQ / Redis) with polling or WebSockets.
- **Single-Tenant / No Auth:** Designed as an internal administrative portal without user roles (e.g. Teacher vs Principal) or multi-tenant school separation.

---

## 4. What I'd Do Next

1. **Background Job Queue:** Move CSV ingestion to background workers for files over 10 MB, streaming progress via Server-Sent Events (SSE).
2. **Cohort Analytics:** Add a dashboard showing grade distributions, pass/fail ratios per section, and subject difficulty heatmaps.
3. **Bulk Export:** Export filtered student tables or report cards directly to bulk PDF or Excel sheets.
4. **Audit Trail:** Maintain an event log of which user/import modified individual marks over time.
