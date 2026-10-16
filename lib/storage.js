import { get, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

async function readSites() {
  const blob = await get("sites.json", { access: "private", useCache: false });
  if (!blob) return [];
  return JSON.parse(await new Response(blob.stream).text());
}

async function writeSites(sites) {
  await put("sites.json", JSON.stringify(sites), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60
  });
}

export async function getSites() {
  return readSites();
}

export async function addSite(url) {
  const sites = await readSites();
  const site = {
    id: randomUUID(), url, text: "", baselineSaved: false,
    lastChecked: null, status: "new", lastMessage: "", diff: null, history: []
  };
  sites.push(site);
  await writeSites(sites);
  return site;
}

export async function findSite(id) {
  return (await readSites()).find(site => site.id === id);
}

export async function saveCheck(id, result) {
  const sites = await readSites();
  const site = sites.find(item => item.id === id);
  if (!site) return;
  if (result.text !== undefined) {
    site.text = result.text;
    site.textMode = result.textMode;
    site.baselineSaved = true;
    site.diff = { added: result.added, removed: result.removed };
  }
  site.lastChecked = result.time;
  site.status = result.status;
  site.lastMessage = result.message;
  site.history.unshift({ time: result.time, message: result.message, status: result.status });
  site.history = site.history.slice(0, 20);
  await writeSites(sites);
}

export async function deleteSite(id) {
  const sites = await readSites();
  const remaining = sites.filter(site => site.id !== id);
  if (remaining.length === sites.length) return false;
  await writeSites(remaining);
  return true;
}