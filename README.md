# 🏃‍♀️ Jog Your Memory with **RunningThoughts**

**RunningThoughts** is inspired by a runner I know who hits the pavement with sneakers and an audiobook and returns home with a reminders app full of thoughts. The goal of RunningThoughts is to:

- Organize thoughts by *run*
- Mark off items after you’ve discussed them
- Make recording a thought easy with a UI that puts speech-to-text at its forefront

Built with: **Node.js**, **Express**, **MongoDB**, **EJS**, and **Bootstrap (Bootswatch "Brite" theme)**.
User authentication via **Passport.js**

🚀 [**Live Demo on Render** »](https://runningthoughts.onrender.com)

---

## ⚙️ Setup

1. Clone the repo and install dependencies.
2. Create a `.env` file with your environment variables:
  - URI (MongoDB connection string)
  - PORT
  - PASSPORT_SECRET
  - PASSPORT_COOKIE
4. To enable localhost, comment out `helmet` config lines in app.js - line 21-38.
5. Run the app:  
   ```bash
   node ./src/index.js

---

## ✨ Features

### 🧠 Organize Your Thoughts by Run

Each note belongs to a **run**, and are grouped as such on the dashboard. Clicking into a run gives you a focused view of that session.

Within a run, you can:
- **Add a title** — By default, the frontend will display the creation date of the run as the title unless you specify a custom one.
- **Clear the run** — Delete all notes from a run.
- **Delete the run** — Remove the run and its notes entirely. If this was your current run, your user record will be updated accordingly.


### ✅ Check Notes Off

Each note includes a checkbox to indicate whether it’s been discussed.

- Notes start as **open** (`open: true` in MongoDB).
- Toggling the checkbox sends a PUT request to toggle this property.
- You can view **all notes**, or **only open notes**, for better focus.
- The `tot_open_notes` field in run documents helps collapse run cards when filtering for open notes only.


### 🚹  Accessibility-First Design

- Tap the **mic button** to start recording a note. Tap again to save.
- Tapping **"New Note"** does *not* start recording automatically, giving the user more control when they want to type out their thoughts.
- Editing a note and tapping the mic appends new speech-to-text at the end of your note draft.
- The mic button is intentionally **large, visible, and mobile-friendly** for use while on the move.


### 🔄 Current Run Logic

RunningThoughts keeps track of your **current run** — the run you last created a note in, within the past 2 hours. It tracks this run and its timing in the user document under `current_run` and `currentRunUpdatedAt`.

- **From the dashboard**: Notes go into your current run. If none exists, a new one is created automatically.
- **From a run page**: Notes are added to that run. That run then becomes your new current run.


### 🔧 Other

- **Efficient data modeling**: Each user can have multiple runs and notes. Summary fields like `tot_notes`, `tot_open_notes`, and `tot_runs` allow quick access without extra queries.
- **Pagination**: Dashboard displays 10 runs per page, with pagination based on `tot_runs` for a given user.
- **Error handling**: Uses `connect-flash` for frontend alerts and `create-http-errors` for custom error statuses and messages.
- **User settings**:
  - Update email and username
  - Change password (via Passport.js)
  - Delete your entire account, or just all of your runs and notes data.
- **Sanitization**: Inputs like usernames, titles, and notes are sanitized with `sanitize-html`. For notes content, whitespace is trimmed and the first character capitalized. This is especially important for speech-to-text input, which can otherwise end up a little messy.
- **Modal confirmations**: Destructive actions (delete note/run/account) require modal confirmation.

---

## 🐞 Problems encountered

### ⚠️ Flash Message Conflicts

When building the app, I originally used a mix of traditional HTML form submissions and JavaScript `fetch()` requests.

This led to a major issue: **flash messages were often discarded** before they could be rendered on the page. This was due to the way some fetch-based requests would redirect and reload the page twice, interrupting the flash message lifecycle.

**Solution**: I converted most of the fetch-based requests to traditional HTML forms to maintain proper redirect and flash message behavior. One fetch-based request remains — toggling a note’s open/closed state. A full page reload is quite disruptive when using this feature, so trading off more robust error handlign was necessary here at this time.


### 🎙 Web Speech-to-Text Limitations

The app uses WebKit’s built-in `SpeechRecognition` API for speech-to-text input. While functional, it's **not nearly as accurate or smooth** as the experience we're now used to with Siri or Google assistant.

For now, this works as a proof of concept. A mobile app in the future could tap into native mobile speech APIs, offering much better recognition, background listening, and more reliable input — ideal for runners on the move.

---

## 🗂 File Structure

[Click here for diagram](https://gitdiagram.com/kyrawest/runningthoughts). [Created with GitDiagram](https://gitdiagram.com/kyrawest/runningthoughts).

```mermaid
flowchart TD
  %% Browser / Frontend
  subgraph "Browser / Frontend"
    direction TB
    A1["SpeechRecognition UI<br/>(script.js)"]:::client
    A2["EJS Views & Partials<br/>(src/views/)"]:::client
    A3["Static Assets<br/>(styles.css, images/)"]:::client
    A1 -->|"speech-to-text"| A2
    A2 -->|"form / fetch"| B1
  end

  %% Server / Backend
  subgraph "Server / Backend: Node.js / Express"
    direction TB
    B1["Express Routes<br/>(router.js, noteRoutes.js,<br/>runRoutes.js, userRoutes.js, renderRoutes.js)"]:::server
    B2["Controllers<br/>(noteController.js,<br/>runController.js,<br/>userController.js,<br/>renderController.js)"]:::server
    B3["Business Logic Handlers<br/>(noteHandler.js,<br/>runHandler.js,<br/>userHandler.js)"]:::server
    B4["Input Validation<br/>(validators.js)"]:::server
    B5["Database Connection<br/>(connect.js)"]:::server
    B6["Entry Point & App Setup<br/>(index.js, app.js)"]:::server
    B7["Auth Config<br/>(passport.js, auth.js)"]:::server
    B8["Middleware & Error Handling<br/>(errorHandlers.js,<br/>Helmet, bodyParser,<br/>connect-flash)"]:::server
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> B5
    B2 --> C1
    B8 --> B1
    B7 --> B3
    B6 --> B1
  end

  %% Database
  subgraph "Database / MongoDB"
    direction TB
    C1["Mongoose Models<br/>(userSchema.js,<br/>runSchema.js,<br/>noteSchema.js)"]:::db
    C1 -->|"persist/retrieve"| C1
  end

  %% External / Browser APIs
  subgraph "External / APIs"
    direction TB
    D1["Web Speech API"]:::external
    D2["Passport.js"]:::external
    D3["connect-flash"]:::external
    D4["Helmet & bodyParser"]:::external
    D1 -.-> A1
    D2 -.-> B7
    D3 -.-> B8
    D4 -.-> B8
  end

  %% Data flows
  A3 -->|"loads assets"| A2
  C1 -->|"DB result"| B2
  B2 -->|"render view"| A2

  %% Click Events
  click A1 "https://github.com/kyrawest/runningthoughts/blob/main/src/public/script.js"
  click A3 "https://github.com/kyrawest/runningthoughts/blob/main/src/public/styles.css"
  click A3 "https://github.com/kyrawest/runningthoughts/tree/main/src/public/images/"
  click A2 "https://github.com/kyrawest/runningthoughts/tree/main/src/views/"
  click B6 "https://github.com/kyrawest/runningthoughts/blob/main/src/index.js"
  click B6 "https://github.com/kyrawest/runningthoughts/blob/main/src/app.js"
  click B5 "https://github.com/kyrawest/runningthoughts/blob/main/src/connect.js"
  click B7 "https://github.com/kyrawest/runningthoughts/blob/main/src/handlers/passport.js"
  click B7 "https://github.com/kyrawest/runningthoughts/blob/main/src/auth/auth.js"
  click B8 "https://github.com/kyrawest/runningthoughts/blob/main/src/handlers/errorHandlers.js"
  click B1 "https://github.com/kyrawest/runningthoughts/blob/main/src/routes/router.js"
  click B1 "https://github.com/kyrawest/runningthoughts/blob/main/src/routes/noteRoutes.js"
  click B1 "https://github.com/kyrawest/runningthoughts/blob/main/src/routes/runRoutes.js"
  click B1 "https://github.com/kyrawest/runningthoughts/blob/main/src/routes/userRoutes.js"
  click B1 "https://github.com/kyrawest/runningthoughts/blob/main/src/routes/renderRoutes.js"
  click B2 "https://github.com/kyrawest/runningthoughts/blob/main/src/controllers/noteController.js"
  click B2 "https://github.com/kyrawest/runningthoughts/blob/main/src/controllers/runController.js"
  click B2 "https://github.com/kyrawest/runningthoughts/blob/main/src/controllers/userController.js"
  click B2 "https://github.com/kyrawest/runningthoughts/blob/main/src/controllers/renderController.js"
  click B3 "https://github.com/kyrawest/runningthoughts/blob/main/src/handlers/noteHandler.js"
  click B3 "https://github.com/kyrawest/runningthoughts/blob/main/src/handlers/runHandler.js"
  click B3 "https://github.com/kyrawest/runningthoughts/blob/main/src/handlers/userHandler.js"
  click B4 "https://github.com/kyrawest/runningthoughts/blob/main/src/validators/validators.js"
  click C1 "https://github.com/kyrawest/runningthoughts/blob/main/src/models/userSchema.js"
  click C1 "https://github.com/kyrawest/runningthoughts/blob/main/src/models/runSchema.js"
  click C1 "https://github.com/kyrawest/runningthoughts/blob/main/src/models/noteSchema.js"

  %% Styles
  classDef client fill:#D0E8FF,stroke:#3B83BD;
  classDef server fill:#D0FFD6,stroke:#57A65A;
  classDef db fill:#FFE2AA,stroke:#E08F3C;
  classDef external fill:#F0F0F0,stroke:#999999,stroke-dasharray: 2 2;
```

---

## Screen recordings and Demos:

## Screenshots and Demos:


<table>
  <tr>
    <td align="center"><strong>Toggling open/closed state</strong><br>
      <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjdhNGpqZTYwajVrcDIyMzgyNWRhM2k3OXo3emZlcHQ0MG15bDNhaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tbcPKIj7QR4lC9fgLJ/giphy.gif" 
           alt="GIF showing a checkbox being toggled to open or close a note" 
           width="300">
    </td>
    <td align="center"><strong>Editing run title</strong><br>
      <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYmZlZW5qMjBjNmZuN255cDB1ZmdibmNnZ25obXA5ZGNlejB3Ynd4cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Sf8XpNuGSksAvp6nRB/giphy.gif" 
           alt="GIF showing a user navigating to a run page and updating the title" 
           width="300">
    </td>
    <td align="center"><strong>Speech-to-text note creation</strong><br>
      <img src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3ZhNDk0b3Z6MHV3OTZoNGN1b203Mmt6eGxyaTlkOG02ZzR5eTFsciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SDNJOf2OdliaIsVJnC/giphy.gif" 
           alt="GIF showing a note being created using speech-to-text input" 
           width="300">
    </td>
  </tr>
</table>


