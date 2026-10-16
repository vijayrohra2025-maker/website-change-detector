import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const file = path.join(process.cwd(), "data", "sites.json");

async function writeSites(sites) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(sites, null, 2));
}

export async function readSites() {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}

export async function addSite(url) {
  const sites = await readSites();
  const site = { id: randomUUID(), url, text: "", baselineSaved: false, lastChecked: null, status: "new", lastMessage: "", diff: null, history: [] };
  sites.push(site); await writeSites(sites); return site;
}

export async function findSite(id) { return (await readSites()).find(site => site.id === id); }

export async function saveCheck(id, result) {
  const sites = await readSites();
  const site = sites.find(item => item.id === id);
  if (!site) return;
  if (result.text !== undefined) { site.text = result.text; site.textMode = result.textMode; site.baselineSaved = true; }
  site.lastChecked = result.time; site.status = result.status; site.lastMessage = result.message;
  if (result.text !== undefined) site.diff = { added: result.added, removed: result.removed };
  site.history.unshift({ time: result.time, message: result.message, status: result.status });
  site.history = site.history.slice(0, 20);
  await writeSites(sites);
}

export async function deleteSite(id) {
  const sites = await readSites(); const remaining = sites.filter(site => site.id !== id);
  if (remaining.length === sites.length) return false;
  await writeSites(remaining); return true;
}
