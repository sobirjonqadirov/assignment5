import assert from "node:assert/strict";
import { test } from "node:test";
import { TranscriptStore } from "../src/transcriptStore.js";
import { createAppServer } from "../src/server.js";

test("BUG-101: deleting a student removes all their grades only", () => {
  const store = new TranscriptStore();
  const deletedID = store.addStudent("Alice");
  const retainedID = store.addStudent("Bob");
  store.addGrade(deletedID, "CS360", 85);
  store.addGrade(deletedID, "CS331", 90);
  store.addGrade(retainedID, "CS360", 75);

  store.deleteStudent(deletedID);

  assert.equal(store.getGrade(deletedID, "CS360"), undefined);
  assert.equal(store.getGrade(deletedID, "CS331"), undefined);
  assert.equal(store.getGrade(retainedID, "CS360"), 75);
  assert.throws(() => store.getTranscript(deletedID), /Student not found/);
});

test("BUG-101: grade endpoint returns 404 after deletion", async (t) => {
  const store = new TranscriptStore();
  const studentID = store.addStudent("Alice");
  store.addGrade(studentID, "CS360", 85);
  const server = createAppServer(store);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections?.();
  }));
  const url = `http://127.0.0.1:${server.address().port}/transcripts/${studentID}`;
  const before = await fetch(`${url}/CS360`);
  assert.equal(before.status, 200);
  assert.equal((await before.json()).grade, 85);
  const deleted = await fetch(url, { method: "DELETE" });
  assert.equal(deleted.status, 204);
  const after = await fetch(`${url}/CS360`);
  const body = await after.json();
  assert.equal(after.status, 404);
  assert.deepEqual(body, { error: "Grade not found" });
});
