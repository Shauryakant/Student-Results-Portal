/**
 * Tracks student IDs seen during a file import to enforce:
 * - Case-insensitive duplicate detection (store in uppercase)
 * - The first row with a given ID is considered the original
 * - Later rows with the same ID in the file are rejected as DUPLICATE_ID,
 *   even if the earlier row was itself rejected.
 */
export class DuplicateTracker {
  private seenIds = new Map<string, number>();

  /**
   * Checks whether the given student ID has appeared earlier in this file.
   * If it has not been seen, records the ID and its line number.
   */
  checkAndRecord(
    studentId: string,
    lineNumber: number,
  ): { isDuplicate: boolean; firstSeenLine?: number } {
    const normalized = studentId.trim().toUpperCase();
    if (this.seenIds.has(normalized)) {
      return {
        isDuplicate: true,
        firstSeenLine: this.seenIds.get(normalized),
      };
    }
    this.seenIds.set(normalized, lineNumber);
    return {
      isDuplicate: false,
    };
  }

  has(studentId: string): boolean {
    return this.seenIds.has(studentId.trim().toUpperCase());
  }

  getFirstSeenLine(studentId: string): number | undefined {
    return this.seenIds.get(studentId.trim().toUpperCase());
  }

  size(): number {
    return this.seenIds.size;
  }

  clear(): void {
    this.seenIds.clear();
  }
}
