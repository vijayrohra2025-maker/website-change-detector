# Website Change Detector

A small Next.js app that saves the readable text of a public web page, then shows added and removed lines when you check it again. It stores the list and up to 20 check-history entries per site in `data/sites.json` on this computer.

## Live demo

**Live website:** _Paste your deployed website URL here after deployment._

## Run it

1. Install Node.js 20.9 or newer.
2. Open the project folder in VS Code, open a terminal with **Terminal → New Terminal**, and run `npm install` once.
3. Install the browser once with `$env:PLAYWRIGHT_BROWSERS_PATH="0"` then `npx playwright install chromium` in PowerShell.
4. Run `npm run dev` and open `http://localhost:3000`.
5. Add a public `https://` URL, then choose **Check now** twice. The first check is its baseline; later checks compare against the last successful check.

Run `npm run build` to make a production build, then `npm start` to serve it. The JSON file is for a small local project. A multi-user hosted app would need a real database and authentication.

Run `npm test` to check baseline messages, added and removed text, private URL blocking, and storage add/check/delete behavior. The test uses Node.js built-in tools and stores its temporary test data outside the project.


## Files

- `app/page.jsx` is the dashboard. `useState` stores the form, site list, loading site, and message in the browser. `useEffect` loads saved sites once. `fetch` sends requests to the API.
- `app/layout.jsx` is the shared HTML wrapper and imports the stylesheet.
- `app/style.css` contains the dashboard styles and the small-screen layout.
- `app/api/sites/route.js` returns the saved list and accepts a new HTTP(S) URL.
- `app/api/sites/[id]/route.js` deletes one site.
- `app/api/sites/[id]/check/route.js` fetches and compares text, then records a successful check or an error.
- `lib/check.js` opens the site in a small headless browser, waits five seconds for JavaScript changes, and reads the visible text. It validates public addresses and every redirect, then limits request count, size, and time.
- `lib/storage.js` reads and writes the small JSON data file.
- `package.json` lists Next.js, React, and Playwright and provides the run commands.

## How the pieces talk

The dashboard calls an API route with `fetch`. An API is a server address that accepts a request and returns a response. For example, adding a site sends a `POST` request to `/api/sites`. Its body is JSON: a simple text format that represents data, such as `{"url":"https://example.com/"}`. The server returns a response with a status code and JSON. `response.json()` turns that response into JavaScript data for the page.

When you choose **Check now**, the browser sends a `POST` to `/api/sites/<id>/check`. The server uses Playwright to open the page, lets JavaScript run for five seconds, reads the visible text, and compares it with the last successful check. Lines present only in the new text are additions; lines only in the previous text are removals. Each later successful check becomes the new version for the next comparison. Failed requests are recorded as errors and do not replace the saved text. Existing sites save a fresh baseline on their first check after this change.

Each site's URL, latest text, last check time, status, latest difference, and recent history are written to `data/sites.json`. The `data/` folder is created on the first write. Do not put secrets or private URLs in this demo.

## Important limits

- It runs page JavaScript for five seconds. Some sites can still block automated browsers or show a CAPTCHA, and there is no noise filter for timestamps or counters.
- Changes to ads, timestamps, counters, or other dynamic text can be reported. This version does not have noise filtering or scheduled checks.
- Checks are started by a button. There are no screenshots, visual selectors, email alerts, or background scheduler in this beginner version.
- Private and internal IP ranges are blocked, redirects are rechecked, and requests time out. Use only public pages you are allowed to monitor.

## Questions you may be asked

**What is the baseline?** The text saved by the first successful check. Future checks compare with the most recent successful text.

**What do API, request, response, and JSON mean?** An API is the server endpoint; a request is what the browser sends; a response is what the server sends back; JSON is the data format used in that exchange.

**How do you prevent unsafe URL fetching?** The server allows only HTTP and HTTPS, resolves the host, rejects private addresses, connects to a validated IP, checks every redirect, and limits time and response size.

**Why save history?** It lets the dashboard show when checks happened and whether each check succeeded, found a change, or failed.

**How would you improve it later?** Add a database, scheduled checks, and configurable filtering after the basic flow is understood. For multiple users, add authentication and per-user data access first.
