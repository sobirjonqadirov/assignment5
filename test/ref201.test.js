import assert from "node:assert/strict";
import { test } from "node:test";
import { TranscriptStore } from "../src/transcriptStore.js";

test("REF-201: both grade operations preserve validation and normalization", () => {
  const store = new TranscriptStore();
  const studentID = store.addStudent("Alice");
  assert.deepEqual(store.addGrade(studentID, " cs360 ", "85"), {
    studentID, course: "CS360", grade: 85,
  });
  for (const operation of ["addGrade", "changeGrade"]) {
    assert.throws(() => store[operation](studentID, " ", 90), {
      message: "Course name is required",
    });
    for (const invalidGrade of [-1, 101, 85.5, "abc"]) {
      assert.throws(() => store[operation](studentID, "CS360", invalidGrade), {
        message: "Grade must be an integer from 0 to 100",
      });
    }
  }
  assert.deepEqual(store.changeGrade(studentID, " cs360 ", "92"), {
    studentID, course: "CS360", grade: 92,
  });
  assert.equal(store.getGrade(studentID, "CS360"), 92);
  assert.throws(() => store.changeGrade(studentID, "cs331", 90), {
    message: "Grade not found for course CS331",
  });
});
