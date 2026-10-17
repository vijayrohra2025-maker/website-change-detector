function clockTabTime(text) {
  // Clocktab puts its live clock first, followed by milliseconds and sync details.
  const match = text.match(/\b(\d{1,2})\s*:\s*(\d{2})\s*:\s*(\d{2})\s*:\s*\d{1,3}\b/);
  return match ? `${match[1].padStart(2, "0")}:${match[2]}:${match[3]}` : null;
}

export function compareText(previous, current, hasBaseline, url = "") {
  const changed = hasBaseline && previous !== current;
  let added = changed ? current.split("\n").filter(line => line && !previous.split("\n").includes(line)).slice(0, 20) : [];
  let removed = changed ? previous.split("\n").filter(line => line && !current.split("\n").includes(line)).slice(0, 20) : [];

  const isClocktab = url && (() => {
    try { return new URL(url).hostname.endsWith("clocktab.com"); }
    catch { return false; }
  })();
  if (changed && isClocktab) {
    const newTime = clockTabTime(current);
    const oldTime = clockTabTime(previous);
    if (newTime && oldTime && newTime !== oldTime) {
      added = [newTime];
      removed = [oldTime];
    }
  }
  const message = !hasBaseline ? "Baseline saved. Check again to detect changes." : changed ? "Website changed." : "No text changes found.";
  return { changed, added, removed, message };
}
