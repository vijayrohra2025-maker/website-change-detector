import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { compareText } from "../lib/compare.js";
import { validatePublicUrl } from "../lib/check.js";

const projectFolder = process.cwd();
const testFolder = await mkdtemp(path.join(os.tmpdir(), "website-check-test-"));

try {
  const baseline = compareText("", "first version", false);
  assert.equal(baseline.message, "Baseline saved. Check again to detect changes.");

  const difference = compareText("old line\nkeep this", "new line\nkeep this", true);
  assert.equal(difference.changed, true);
  assert.deepEqual(difference.added, ["new line"]);
  assert.deepEqual(difference.removed, ["old line"]);

  const same = compareText("same", "same", true);
  assert.equal(same.changed, false);
  assert.equal(same.message, "No text changes found.");

  await assert.rejects(validatePublicUrl("http://127.0.0.1"), /private|safely/i);
  await assert.rejects(validatePublicUrl("file:///secret.txt"), /http and https/i);

  process.chdir(testFolder);
  const storagePath = pathToFileURL(path.join(projectFolder, "lib", "storage.js")).href;
  const storage = await import(`${storagePath}?test=${Date.now()}`);
  assert.deepEqual(await storage.readSites(), []);

  const site = await storage.addSite("https://example.com");
  assert.equal((await storage.findSite(site.id)).url, "https://example.com");
  await storage.saveCheck(site.id, {
    text: "snapshot", textMode: "browser", added: [], removed: [],
    message: "Baseline saved.", status: "ok", time: new Date().toISOString()
  });
  assert.equal((await storage.findSite(site.id)).history.length, 1);
  assert.equal(await storage.deleteSite(site.id), true);
  assert.deepEqual(await storage.readSites(), []);

  console.log("Passed: baseline, text differences, URL safety, and storage checks.");
} finally {
  process.chdir(projectFolder);
  await rm(testFolder, { recursive: true, force: true });
}
