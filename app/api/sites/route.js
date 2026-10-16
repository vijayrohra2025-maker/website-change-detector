import { addSite, getSites } from "../../../lib/storage.js";
import { validatePublicUrl } from "../../../lib/check.js";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await getSites());
}

export async function POST(request) {
  try {
    const { url } = await request.json();
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
    await validatePublicUrl(parsed.href);
    const sites = await getSites();
    if (sites.some(site => site.url === parsed.href)) return Response.json({ error: "That URL is already monitored." }, { status: 409 });
    const site = await addSite(parsed.href);
    return Response.json(site, { status: 201 });
  } catch {
    return Response.json({ error: "Enter a valid public http or https URL." }, { status: 400 });
  }
}
