import assert from "node:assert/strict";
import { test } from "node:test";
import { TranscriptStore } from "../src/transcriptStore.js";

test("BUG-103: name lookup ignores case and surrounding whitespace", () => {
  const store = new TranscriptStore();
  const studentID = store.addStudent("Alice Smith");
  const otherID = store.addStudent("Bob Smith");

  assert.deepEqual(store.getStudentIDs("alice smith"), [studentID]);
  assert.deepEqual(store.getStudentIDs("  Alice Smith  "), [studentID]);
  assert.deepEqual(store.getStudentIDs("  ALICE SMITH  "), [studentID]);
  assert.deepEqual(store.getStudentIDs("Alice"), []);
  assert.deepEqual(store.getStudentIDs(), [studentID, otherID]);
  assert.equal(store.getTranscript(studentID).student.studentName, "Alice Smith");
});
