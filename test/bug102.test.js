import assert from "node:assert/strict";
import { test } from "node:test";
import { TranscriptStore } from "../src/transcriptStore.js";

test("BUG-102: duplicate grades are rejected without overwriting", () => {
  const store = new TranscriptStore();
  const studentID = store.addStudent("Alice");
  store.addGrade(studentID, "CS360", 85);

  assert.throws(() => store.addGrade(studentID, " cs360 ", 95), {
    message: "Grade already exists for course CS360",
  });
  assert.equal(store.getGrade(studentID, "CS360"), 85);
  assert.deepEqual(store.changeGrade(studentID, "cs360", 95), {
    studentID, course: "CS360", grade: 95,
  });
  assert.equal(store.getGrade(studentID, "CS360"), 95);
});
