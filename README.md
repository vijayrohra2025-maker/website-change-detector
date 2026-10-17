# Website Change Detector

A beginner-friendly web app that saves the visible text of a public webpage and compares it with later checks, showing added and removed text. It uses Next.js, React, Playwright, and private Vercel Blob storage.

## Live demo

[Open the deployed app](https://website-change-detector-beta.vercel.app)

## Run locally

### Requirements

- Node.js 20.9 or newer
- A Vercel account and a Blob store connected to this project

### Setup

1. Open this project folder in VS Code.
2. Open **Terminal → New Terminal** and run:

   ```powershell
   npm install
   npx playwright install chromium
   ```

3. Link the project to Vercel and download its environment variables, including the Blob credentials:

   ```powershell
   npx vercel link
   npx vercel env pull .env.local
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Add a public HTTP or HTTPS URL and select **Check now**. The first successful check saves a baseline; later checks compare against it.

Keep `.env.local` private. Never commit it to GitHub.

## Useful commands

```powershell
npm test       # run the included implementation checks
npm run build  # build the app for production
```

## Notes

- Checks are started manually; there is no automatic schedule.
- Some websites block automated browsers, and changing clocks or other dynamic text can appear as a change.
- Website data is stored in the connected private Vercel Blob store.
