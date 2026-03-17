# sotw-mod-tools

GScript Tools for Google Sheets. Used for managing the Screenshot of the Week competition on Arqade (Gaming Stack Exchange).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Google Account Connection](#google-account-connection)
- [Local Development](#local-development)
- [Deploying to Apps Script](#deploying-to-apps-script)
- [Available Scripts](#available-scripts)

## Prerequisites

Before getting started, make sure you have the following:

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/) (included with Node.js)
- A Google account with access to Google Sheets and Google Apps Script

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/RyanRobotnik/sotw-mod-tools.git
   cd sotw-mod-tools
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Google Account Connection

This project uses [clasp](https://github.com/google/clasp) (Command Line Apps Script Projects) to manage deployments to Google Apps Script.

### Log in to Google

```bash
npm run clasp:login
```

A browser window will open asking you to authorize clasp to access your Google account. Sign in and grant the requested permissions.

> **Note:** Your credentials are stored locally at `~/.clasprc.json`. Keep this file secure and never commit it to version control.

### Link to an Existing Apps Script Project

Copy the provided template to create your local clasp config:

```bash
cp .clasp.json.example .clasp.json
```

Open `.clasp.json` and replace `<YOUR_SCRIPT_ID>` with the script ID from your Apps Script project URL:

```
https://script.google.com/d/<SCRIPT_ID>/edit
```

Your `.clasp.json` should look like this:

```json
{
  "scriptId": "your-script-id-here",
  "rootDir": "./dist"
}
```

> **Note:** `.clasp.json` is listed in `.gitignore` because it contains a user-specific script ID. Do not commit it.

### Create a New Apps Script Project

To create a new Apps Script project linked to a Google Sheet, run the following after logging in:

```bash
npx clasp create --title "sotw-mod-tools" --type sheets --parentId "<GOOGLE_SHEET_ID>"
```

Replace `<GOOGLE_SHEET_ID>` with the ID of your target Google Sheet (found in the sheet's URL).

## Local Development

### Building

Compile TypeScript source files to JavaScript:

```bash
npm run build
```

Compiled files are output to the `dist/` directory. The `appsscript.json` manifest is also copied there automatically.

### Linting

Check source files for code style and type errors:

```bash
npm run lint
```

Auto-fix lint issues where possible:

```bash
npm run lint:fix
```

### Testing

Run the test suite:

```bash
npm test
```

## Deploying to Apps Script

### Push Code

After building, push the compiled code to your linked Apps Script project:

```bash
npm run clasp:push
```

Or build and push in one step:

```bash
npm run deploy
```

### Create a New Version

Create a new versioned deployment (useful for stable releases):

```bash
npm run clasp:deploy
```

### Pull Latest Code

Pull the latest code from Apps Script to your local machine:

```bash
npm run clasp:pull
```

### Open in Apps Script Editor

Open the project directly in the Apps Script web editor:

```bash
npm run clasp:open
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript source files to JavaScript |
| `npm test` | Run the test suite with Jest |
| `npm run lint` | Run ESLint on source files |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run clasp:login` | Authenticate with your Google account |
| `npm run clasp:push` | Push compiled code to Apps Script |
| `npm run clasp:pull` | Pull latest code from Apps Script |
| `npm run clasp:deploy` | Create a new versioned deployment |
| `npm run clasp:open` | Open project in Apps Script web editor |
| `npm run deploy` | Build and push code to Apps Script |
