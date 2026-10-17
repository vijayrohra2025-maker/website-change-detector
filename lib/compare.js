function extractClock(text) {
  const match = text.replace(/\s+/g, " ").match(/\b(\d{1,2})\s*:\s*(\d{2})(?:\s*:\s*(\d{1,2}))?\b/);
  if (!match) return null;
  const hourMinute = `${match[1].padStart(2, "0")}:${match[2]}`;
  return match[3] ? `${hourMinute}:${match[3].padStart(2, "0")}` : hourMinute;
}

export function compareText(previous, current, hasBaseline, url = "") {
  const changed = hasBaseline && previous !== current;
  let added = changed ? current.split("\n").filter(line => line && !previous.split("\n").includes(line)).slice(0, 20) : [];
  let removed = changed ? previous.split("\n").filter(line => line && !current.split("\n").includes(line)).slice(0, 20) : [];

  const host = (() => { try { return new URL(url).hostname; } catch { return ""; } })();
  if (changed && /(^|\.)(clocktab\.com|digitalclock\.live)$/.test(host)) {
    const oldClock = extractClock(previous);
    const newClock = extractClock(current);
    if (oldClock && newClock && oldClock !== newClock) {
      added = [newClock];
      removed = [oldClock];
    }
  }
  const message = !hasBaseline ? "Baseline saved. Check again to detect changes." : changed ? "Website changed." : "No text changes found.";
  return { changed, added, removed, message };
}
