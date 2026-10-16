export function compareText(previous, current, hasBaseline) {
  const changed = hasBaseline && previous !== current;
  const added = changed ? current.split("\n").filter(line => line && !previous.split("\n").includes(line)).slice(0, 20) : [];
  const removed = changed ? previous.split("\n").filter(line => line && !current.split("\n").includes(line)).slice(0, 20) : [];
  const message = !hasBaseline ? "Baseline saved. Check again to detect changes." : changed ? "Website changed." : "No text changes found.";
  return { changed, added, removed, message };
}
