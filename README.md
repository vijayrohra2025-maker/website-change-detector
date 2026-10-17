# Website Change Detector

Website Change Detector monitors the visible text of public webpages. It saves a baseline, then compares later checks and shows which text was added or removed.

## Project Links

- **GitHub Repository:** [website-change-detector](https://github.com/vijayrohra2025-maker/website-change-detector)
- **Live Website:** [website-change-detector-beta.vercel.app](https://website-change-detector-beta.vercel.app/)

## Features

- **Website Monitoring:** Add a public HTTP or HTTPS URL to the watchlist.
- **Change Detection:** Compare the current visible text with the most recent successful check.
- **Added and Removed Text:** See lines that appeared or disappeared.
- **Check History:** View recent check times and results for each website.
- **Status Messages:** See whether a check succeeded, found changes, or failed.
- **Manual Checks:** Run a check with the **Check now** button.
- **Private Cloud Storage:** Save monitored sites, snapshots, and history in Vercel Blob.
- **Dark Mode:** Switch the dashboard theme.

## Technologies Used

- Next.js and React
- JavaScript and Node.js
- Playwright with Chromium
- Vercel Blob private storage
- CSS

## How It Works

1. Add a public website URL in the dashboard.
2. The server validates the URL and uses Playwright to load the page.
3. It reads the visible page text and saves it as the baseline on the first successful check.
4. Later checks compare the new text with the previous successful snapshot.
5. The dashboard shows added and removed lines, and saves the result in the website’s check history.

## Installation and Setup

### Prerequisites

- Node.js 20.9 or newer
- npm
- A Vercel account with a Blob store connected to this project

### Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/vijayrohra2025-maker/website-change-detector.git
   ```

2. Open the project folder:

   ```bash
   cd website-change-detector
   ```

3. Install the dependencies and Playwright browser:

   ```bash
   npm install
   npx playwright install chromium
   ```

4. Link the project to Vercel and download its environment variables for Blob storage:

   ```bash
   npx vercel link
   npx vercel env pull .env.local
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser. Add a URL and select **Check now**. The first successful check saves a baseline; check again later to see changes.

Do not commit `.env.local` or share its contents; it may contain storage credentials.

## Testing

The project includes checks for baseline behavior, added and removed text, URL safety, and storage operations. After linking the project and pulling its environment variables, run:

```bash
npm test
```

## Limitations

- Checks are started manually; there are no scheduled checks or notifications.
- Some websites block automated browsers or require a CAPTCHA.
- Dynamic text such as clocks, counters, and advertisements can appear as changes.
- The app compares visible text and does not provide screenshot or visual comparison.

## Future Improvements

- Add scheduled checks and email notifications.
- Add filters for dynamic content such as clocks and counters.
- Show a more detailed before-and-after comparison.
- Add user accounts and per-user website lists.
