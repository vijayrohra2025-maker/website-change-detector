export function compareText(previous, current, hasBaseline) {
  const changed = hasBaseline && previous !== current;
  const previousLines = previous.split("\n");
  const currentLines = current.split("\n");
  const added = changed ? currentLines.filter(line => line && !previousLines.includes(line)).slice(0, 20) : [];
  const removed = changed ? previousLines.filter(line => line && !currentLines.includes(line)).slice(0, 20) : [];
  const message = !hasBaseline ? "Baseline saved. Check again to detect changes." : changed ? "Website changed." : "No text changes found.";
  return { changed, added, removed, message };
}
