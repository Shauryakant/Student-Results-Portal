import { describe, it, expect } from 'vitest';
import { DuplicateTracker } from './duplicateTracker';

describe('DuplicateTracker', () => {
  it('registers the first occurrence as original and subsequent occurrences as duplicate', () => {
    const tracker = new DuplicateTracker();

    const first = tracker.checkAndRecord('STU00005', 6);
    expect(first.isDuplicate).toBe(false);

    const second = tracker.checkAndRecord('STU00005', 21);
    expect(second.isDuplicate).toBe(true);
    expect(second.firstSeenLine).toBe(6);
  });

  it('performs case-insensitive duplicate detection', () => {
    const tracker = new DuplicateTracker();

    expect(tracker.checkAndRecord('stu00010', 10).isDuplicate).toBe(false);
    expect(tracker.checkAndRecord('STU00010', 25).isDuplicate).toBe(true);
  });

  it('trims whitespace when checking duplicates', () => {
    const tracker = new DuplicateTracker();

    expect(tracker.checkAndRecord('  STU00015  ', 5).isDuplicate).toBe(false);
    expect(tracker.checkAndRecord('STU00015', 12).isDuplicate).toBe(true);
  });

  it('correctly tracks size and clears', () => {
    const tracker = new DuplicateTracker();
    tracker.checkAndRecord('STU001', 2);
    tracker.checkAndRecord('STU002', 3);
    tracker.checkAndRecord('STU001', 4);

    expect(tracker.size()).toBe(2);
    tracker.clear();
    expect(tracker.size()).toBe(0);
  });
});
