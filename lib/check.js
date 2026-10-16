import dns from "node:dns/promises";
import net from "node:net";
import https from "node:https";
import http from "node:http";

let chromium;

async function validateUrl(url) {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error("Only public http and https URLs are allowed.");
  const addresses = await dns.lookup(parsed.hostname, { all: true });
  if (!addresses.length || addresses.some(item => !isPublic(item.address))) throw new Error("This address is private or cannot be checked safely.");
  return { parsed, ip: addresses[0] };
}

function isPublic(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && [0, 2, 168].includes(b)) || (a === 198 && [18, 19, 51].includes(b)) || (a === 203 && b === 0) || (a === 100 && b >= 64 && b <= 127));
  }
  if (net.isIPv6(ip)) {
    const value = ip.toLowerCase();
    if (value.startsWith("::ffff:")) return isPublic(value.slice(7));
    return (value.startsWith("2") || value.startsWith("3")) && !value.startsWith("2001:db8:");
  }
  return false;
}

async function fetchPage(url, redirects = 0, headers = {}) {
  if (redirects > 3) throw new Error("Too many redirects.");
  const { parsed, ip } = await validateUrl(url);
  const transport = parsed.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.get(parsed, {
      timeout: 8000,
      headers: {
        "User-Agent": "SimpleWebsiteChangeDetector/1.0",
        Accept: headers.accept || "*/*",
        "Accept-Encoding": "identity",
        ...(headers.referer && { Referer: headers.referer }),
        ...(headers.origin && { Origin: headers.origin })
      },
      lookup: (_host, options, callback) => options?.all ? callback(null, [ip]) : callback(null, ip.address, ip.family)
    }, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
        response.resume();
        if (!response.headers.location) return reject(new Error("Redirect has no destination."));
        return resolve(fetchPage(new URL(response.headers.location, parsed).href, redirects + 1, headers));
      }
      const chunks = []; let size = 0;
      response.on("data", chunk => {
        size += chunk.length;
        if (size > 2_000_000) request.destroy(new Error("Page resource is larger than 2 MB."));
        else chunks.push(chunk);
      });
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    });
    request.on("timeout", () => request.destroy(new Error("Website took too long to respond.")));
    request.on("error", reject);
  });
}

export async function validatePublicUrl(url) {
  await validateUrl(url);
}

export async function checkWebsite(url) {
  process.env.PLAYWRIGHT_BROWSERS_PATH ||= "0";
  chromium ||= (await import("playwright")).chromium;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ serviceWorkers: "block" });
    let requests = 0; let totalBytes = 0;
    await context.route("**/*", async route => {
      const request = route.request();
      if (++requests > 80 || request.method() !== "GET" || !["document", "script", "stylesheet", "xhr", "fetch", "other"].includes(request.resourceType())) return route.abort();
      try {
        const result = await fetchPage(request.url(), 0, await request.allHeaders());
        totalBytes += result.body.length;
        if (totalBytes > 8_000_000) return route.abort();
        const safeHeaders = {};
        for (const name of ["content-type", "content-security-policy", "x-content-type-options", "access-control-allow-origin", "access-control-allow-credentials", "cache-control"]) {
          if (result.headers[name]) safeHeaders[name] = result.headers[name];
        }
        await route.fulfill({ status: result.status, headers: safeHeaders, body: result.body });
      } catch { await route.abort(); }
    });
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    if (!response || response.status() >= 400) throw new Error(`Website returned HTTP ${response?.status() || "no response"}.`);
    await page.waitForTimeout(5000);
    return (await page.locator("body").innerText({ timeout: 3000 })).slice(0, 500_000);
  } finally {
    await browser.close();
  }
}
