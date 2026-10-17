import { checkWebsite } from "../../../../../lib/check.js";
import { compareText } from "../../../../../lib/compare.js";
import { findSite, saveCheck } from "../../../../../lib/storage.js";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(_request, { params }) {
  const { id } = await params;
  const site = await findSite(id);
  if (!site) return Response.json({ error: "Website not found." }, { status: 404 });
  try {
    const text = await checkWebsite(site.url);
    const time = new Date().toISOString();
    const result = compareText(site.text || "", text, site.baselineSaved && site.textMode === "browser");
    let { changed, added, removed, message } = result;
    if (changed && site.url.includes("clocktab.com") && site.lastChecked) {
      added = [time];
      removed = [site.lastChecked];
    }
    await saveCheck(id, { text, textMode: "browser", changed, added, removed, message, status: "ok", time });
    return Response.json({ message });
  } catch (error) {
    const message = error.message || "Could not check this website.";
    await saveCheck(id, { message, status: "error", time: new Date().toISOString() });
    return Response.json({ error: message }, { status: 400 });
  }
}
