"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [sites, setSites] = useState([]);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const changedCount = sites.filter(site => site.lastMessage === "Website changed.").length;

  async function loadSites() {
    const response = await fetch("/api/sites");
    setSites(await response.json());
  }

  useEffect(() => { loadSites(); }, []);

  async function addSite(event) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/sites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error);
    setUrl(""); setMessage("Website added. Run a check to save its first version."); loadSites();
  }

  async function checkSite(id) {
    setBusy(id); setMessage("");
    const response = await fetch(`/api/sites/${id}/check`, { method: "POST" });
    const data = await response.json();
    setMessage(response.ok ? data.message : data.error);
    await loadSites(); setBusy("");
  }

  async function deleteSite(id) {
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    loadSites();
  }

  return <main className={`wrap ${darkMode ? "dark" : ""}`}>
    <header className="header-row"><div><p className="eyebrow">A simple monitoring tool</p><h1>Website Change Detector</h1><p>Save a page’s text, then check again to see what changed.</p></div><button type="button" className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>{darkMode ? "☀ Light mode" : "☾ Dark mode"}</button></header>
    <div className="stats">
      <article><span className="stat-icon">◎</span><div><strong>{sites.length}</strong><span>Websites monitored</span></div></article>
      <article><span className="stat-icon violet">↗</span><div><strong>{changedCount}</strong><span>Changes found</span></div></article>
    </div>
    <form className="add-form" onSubmit={addSite}>
      <div className="form-heading"><span className="form-icon">＋</span><div><h2>Start monitoring a page</h2><p>Paste a public URL and take your first snapshot.</p></div></div>
      <label htmlFor="url">Public website URL</label>
      <div className="form-row"><input id="url" type="url" placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} required /><button>Add website</button></div>
    </form>
    {message && <p className="message" role="status">{message}</p>}
    <section><div className="section-title"><div><p className="section-label">YOUR WATCHLIST</p><h2>Monitored websites</h2></div><span>{sites.length} total</span></div>
      {!sites.length ? <p className="empty">No websites yet. Add a public URL above to get started.</p> : <div className="cards">{sites.map(site => <article className="card" key={site.id}>
        <div className="card-top"><div><h3>{site.url}</h3><p>Last checked: {site.lastChecked ? new Date(site.lastChecked).toLocaleString() : "Never"}</p></div><span className={`status ${site.status}`}>{site.status || "new"}</span></div>
        <p className="result">{site.lastMessage || "No checks yet."}</p>
        {site.diff && <div className="diff"><p className="added">+ Added: {site.diff.added.join(" · ") || "Nothing"}</p><p className="removed">− Removed: {site.diff.removed.join(" · ") || "Nothing"}</p></div>}
        <details><summary>Check history ({site.history.length})</summary><ol>{site.history.map((item, i) => <li key={i}>{new Date(item.time).toLocaleString()} — {item.message}</li>)}</ol></details>
        <div className="actions"><button onClick={() => checkSite(site.id)} disabled={busy === site.id}>{busy === site.id ? "Checking…" : "Check now"}</button><button className="delete" onClick={() => deleteSite(site.id)}>Delete</button></div>
      </article>)}</div>}
    </section>
    <footer>Checks run the page briefly and compare its visible text. Some sites may block automated checks.</footer>
  </main>;
}

