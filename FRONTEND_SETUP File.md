# Patient Assessment System — Frontend Setup Guide

## Prerequisites

Before setting up the frontend, make sure the backend is already running correctly at `http://127.0.0.1:8000`. The frontend depends on the backend API for all its data.

---

## Step 1 — Install Node.js

React requires Node.js to run. If you do not have it installed:

1. Go to **https://nodejs.org**
2. Download the **LTS version** (the one marked "Recommended For Most Users")
3. Run the installer and follow the prompts — all default settings are fine

After installation, open your terminal and verify:

```bash
node --version
```
Expected output: `v18.x.x` or higher

```bash
npm --version
```
Expected output: `9.x.x` or higher

> ⚠️ If either command is not recognised, close and reopen your terminal after installation. If it still fails, restart your computer.

---

## Step 2 — Create the React Project

Open your terminal and navigate to the **same parent folder** where `patient_assessment_api` lives.

For example, if your backend project is at:
```
Desktop/DataVerse/patient_assessment_api/
```

Then navigate to:
```bash
cd Desktop/DataVerse
```

Then run:

```bash
npx create-react-app patient_assessment_frontend
```

This command:
- Creates a new folder called `patient_assessment_frontend`
- Installs all the core React files and dependencies
- Sets up a working development environment automatically

> ⏱️ This takes 2–3 minutes depending on your internet speed. Wait for it to finish completely before moving on.

When it finishes you should see:
```
Success! Created patient_assessment_frontend
```

Now navigate into the new project folder:

```bash
cd patient_assessment_frontend
```

Your folder structure should now look like this:
```
DataVerse/
├── patient_assessment_api/       ← your existing backend
└── patient_assessment_frontend/  ← your new frontend (just created)
```

---

## Step 3 — Fix react-scripts (IMPORTANT — Do Not Skip)

> ⚠️ **This step did not exist in the original guide. It was added after a known issue was discovered during testing.**

After `create-react-app` runs, it sometimes installs `react-scripts` at version `0.0.0` — which is not a real version. This causes `npm start` to fail with:

```
'react-scripts' is not recognized as an internal or external command
```

You can confirm this is the issue by checking your `package.json`. If you see this line:

```json
"react-scripts": "^0.0.0"
```

...then you have the broken version. Fix it by running:

```bash
npm install react-scripts@5.0.1 --save
```

> ⏱️ This takes 3–5 minutes and will install approximately 1,300+ packages. This is expected and correct — wait for it to finish completely.

When it finishes you should see something like:
```
added 1258 packages, audited 1361 packages
```

> ✅ **1,000+ packages is the correct number.** If you only see 100–200 packages after the initial `create-react-app`, it means `react-scripts` did not install properly and you must run the command above.

> ℹ️ You will also see several deprecation warnings during this install — lines starting with `npm warn deprecated`. These are normal and do not affect the app. Ignore them and continue.

---

## Step 4 — Install Project Dependencies

With your terminal still inside `patient_assessment_frontend`, run:

```bash
npm install react-router-dom axios recharts lucide-react
```

This installs four packages the frontend needs:

| Package | What it does |
|---|---|
| `react-router-dom` | Handles navigation between pages (Login → Dashboard → Session etc.) |
| `axios` | Makes HTTP requests to the FastAPI backend — cleaner than fetch |
| `recharts` | Renders charts for the dashboard and admin analytics panels |
| `lucide-react` | Provides clean, consistent icons throughout the interface |

> ⏱️ This takes 1–2 minutes. Wait until you see your terminal prompt return before continuing.

Verify the packages were installed by checking `package.json` — you should see all four listed under `dependencies`.

---

## Step 5 — Copy the Source Files

Replace the default `src/` folder that `create-react-app` generated with the project source files provided by your instructor.

Your final `src/` folder should look like this:

```
patient_assessment_frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js              ← API base URL and JWT token configuration
│   ├── context/
│   │   └── AuthContext.js        ← JWT token management across the app
│   ├── components/
│   │   ├── Sidebar.jsx           ← persistent navigation sidebar
│   │   ├── Navbar.jsx            ← top navigation bar
│   │   └── ProtectedRoute.jsx    ← blocks unauthenticated access to pages
│   ├── pages/
│   │   ├── Register.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewSession.jsx
│   │   ├── SessionHistory.jsx
│   │   ├── SessionDetail.jsx
│   │   ├── RunPrediction.jsx
│   │   ├── Chatbot.jsx
│   │   └── admin/
│   │       ├── AdminLogin.jsx
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminClinicians.jsx
│   │       ├── AdminSessions.jsx
│   │       ├── AdminPredictions.jsx
│   │       └── AdminExport.jsx
│   ├── styles/
│   │   └── global.css            ← shared styles and colour variables
│   ├── App.js                    ← all routes and app layout
│   └── index.js                  ← React entry point (do not edit)
```

---

## Step 6 — Start the Development Server

Run:

```bash
npm start
```

This starts the React development server. After a few seconds your browser should automatically open at:

```
http://localhost:3000
```

You should land on the **Login page** of the Patient Assessment System. This confirms everything is set up correctly.

> ✅ **Both servers must run at the same time during development:**
> - Backend: `http://127.0.0.1:8000` (uvicorn)
> - Frontend: `http://localhost:3000` (npm start)
>
> Keep two terminal windows open — one for each. If either server is not running, the app will not work.

---

## What the Frontend Contains

The frontend is split into two panels:

### Clinical Workflow (Clinician Login)
| Screen | Description |
|---|---|
| Register | Clinical staff creates an account |
| Login | Staff logs in, JWT token stored in session |
| Dashboard | Overview of sessions, predictions, and charts |
| New Session | Open a session for a patient |
| Session History | List of all past sessions with status and counts |
| Session Detail | View one full session with all its predictions |
| Run Predictions | Select model, enter patient data or upload image |
| Chatbot | AI conversation tied to a specific session |

### Admin Panel (Admin Login)
| Screen | Description |
|---|---|
| Admin Login | Separate login page — credentials from `.env` file |
| Admin Dashboard | System-wide stats and charts |
| Clinician Management | View all staff, suspend or activate accounts |
| All Sessions | Sessions across all clinicians |
| All Predictions | Full audit trail with filters |
| CSV Export | Download any table as a CSV file |

---

## Common Setup Errors

| Error | Fix |
|---|---|
| `'react-scripts' is not recognized` | Run `npm install react-scripts@5.0.1 --save` — see Step 3 |
| `npm install` only installs ~100 packages | Same fix — `react-scripts` version is `0.0.0`, run Step 3 |
| `npx: command not found` | Node.js not installed correctly — reinstall from nodejs.org |
| `npm install` fails with permission error | Run terminal as administrator (Windows) or use `sudo` (Mac) |
| Browser does not open automatically | Manually visit `http://localhost:3000` |
| Port 3000 already in use | Terminal will ask if you want to use a different port — type `Y` |
| Backend API calls fail (CORS error) | Make sure the backend server is running at `http://127.0.0.1:8000` |
| Admin dashboard shows "Failed to load analytics" | Backend `500` error — check the backend terminal for `TypeError: fromisoformat`. Fix is in the backend `admin_panel.py` — see instructor. |

---

## Compiled with Warnings — Is That Normal?

When you run `npm start` you may see output like this:

```
Compiled with warnings.
src\pages\Dashboard.jsx
  Line 15:10:  'riskColor' is defined but never used  no-unused-vars
```

> ✅ **This is normal. Warnings do not stop the app from running.**

Warnings are ESLint notices about unused imports or minor code style issues. They do not affect functionality. The app will load and work correctly despite these messages.

Errors (which do stop the app) look different — they say `Failed to compile` instead of `Compiled with warnings`.

---

## Ready to Build

Once you see the Login page at `http://localhost:3000` and the backend is running at `http://127.0.0.1:8000`, you are fully set up.

**Let your instructor know and the session will begin.**
