# Poll Project

A small full-stack poll app built to show a clean end-to-end flow:

1. A user creates a poll with a question and a few options.
2. The backend saves the poll and returns its ID.
3. Anyone with the link can open the poll and vote once.
4. The app shows the current results for that poll.

## Tech Stack

- Frontend: React + Vite
- Backend: Express
- Database: PostgreSQL

## Simplest Mental Model

Think of the project as 3 layers:

- React frontend: two pages
  - `/` creates a poll
  - `/poll/:id` lets people vote and view results
- Express API: four endpoints
  - `POST /api/polls`
  - `GET /api/polls/:id`
  - `POST /api/polls/:id/vote`
  - `GET /api/polls/:id/results`
- PostgreSQL database: three main tables
  - `polls`
  - `poll_options`
  - `votes`

That is the whole product story.

## SQL Table Structure

There is no migration file checked into the repo, so this schema is inferred from the backend queries in `pollController.js`.

```sql
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  creator_username TEXT NOT NULL
);

CREATE TABLE poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  UNIQUE (poll_id, username)
);
```

### Why These Tables Matter

- `polls` stores the main question and creator name
- `poll_options` stores each answer choice for a poll and its running vote count
- `votes` stores who voted for what and prevents duplicate voting with `UNIQUE (poll_id, username)`

## Request Flow

This is the most useful technical flow to explain in an interview:

1. A user opens the create page at `/`.
2. The frontend collects the question, options, and optional creator name.
3. `CreatePoll.jsx` sends a `POST /api/polls` request.
4. The backend inserts one row into `polls`, then inserts the options into `poll_options`.
5. The backend returns the new poll ID.
6. The frontend builds a shareable URL like `/poll/:id`.
7. Another user opens that poll URL.
8. `PollView.jsx` sends `GET /api/polls/:id` to load the question and options.
9. When the user votes, the frontend sends `POST /api/polls/:id/vote`.
10. The backend saves the vote and updates the selected option's vote count.
11. If the same username tries to vote twice on the same poll, the database rejects it and the backend returns a friendly error.
12. The frontend can request `GET /api/polls/:id/results` to show total votes and per-option counts.

## Folder Walkthrough

If someone asks you to explain the codebase, walk through it in this order:

1. [frontend/src/App.jsx](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\frontend\src\App.jsx): defines the two routes
2. [frontend/src/pages/CreatePoll.jsx](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\frontend\src\pages\CreatePoll.jsx): create flow
3. [frontend/src/pages/PollView.jsx](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\frontend\src\pages\PollView.jsx): vote and results flow
4. [frontend/src/utils/api.js](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\frontend\src\utils\api.js): all frontend-to-backend requests
5. [backend/src/server.js](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\backend\src\server.js): Express app startup
6. [backend/src/routes/pollRoutes.js](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\backend\src\routes\pollRoutes.js): endpoint mapping
7. [backend/src/controllers/pollController.js](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\backend\src\controllers\pollController.js): main backend logic
8. [backend/src/config/db.js](C:\Users\User\OneDrive\Desktop\NegevTalent\dev\Projects\poll-project\backend\src\config\db.js): PostgreSQL connection

## Folder Structure

```text
frontend/src/
  App.jsx
  pages/CreatePoll.jsx
  pages/PollView.jsx
  utils/api.js

backend/src/
  server.js
  config/db.js
  routes/pollRoutes.js
  controllers/pollController.js
```

## What Each Part Does

### Frontend

- `CreatePoll.jsx`: collects the question, options, and creator name, then calls the API to create a poll
- `PollView.jsx`: loads a poll by ID, lets a user vote, and can switch to the results view
- `api.js`: keeps all fetch calls in one place

### Backend

- `server.js`: starts Express, loads middleware, and mounts the poll routes
- `pollRoutes.js`: maps URLs to controller functions
- `pollController.js`: contains the logic for creating polls, reading polls, voting, and computing results
- `db.js`: creates the PostgreSQL connection pool

## Interview Explanation

If you want the shortest good explanation, say this:

> I built a simple full-stack polling app with React, Express, and PostgreSQL. The frontend has two main screens: one to create a poll and one to vote or view results. The backend exposes four REST endpoints, and the database stores polls, options, and votes. I also added duplicate-vote protection by enforcing one vote per username per poll in the database.

## Interview Script

### 60-Second Version

> I built a simple full-stack polling app with React, Express, and PostgreSQL. The user flow is straightforward: create a poll, share the link, vote once, and view live results. On the frontend I kept it to two main pages, one for creating the poll and one for voting and viewing results. On the backend I exposed four REST endpoints for create, fetch, vote, and results. The database stores polls, poll options, and votes, and I used a uniqueness rule on poll plus username to prevent duplicate voting. I kept the architecture deliberately small so the full request flow is easy to follow and easy to explain.

### 2-Minute Version

> This project was meant to show full-stack ownership without unnecessary complexity. The frontend is a React app with two routes: the home page creates a poll, and the poll page loads a poll by ID, lets a user vote, and can switch to the results view. I centralized the HTTP calls in one small API utility so the page components stay focused on user flow. On the backend I used Express with a small route-controller structure. The controller handles creating the poll, loading it with its options, recording a vote, and returning aggregated results. The database is PostgreSQL, and the main tables are polls, poll_options, and votes. One detail I’m happy with is that duplicate voting is enforced in the database, not just in the UI, so the business rule is reliable. If I kept iterating, I’d add automated tests and database transactions, but for an interview project I wanted the main architecture to stay very clear.

## What Is Good About This Project

- It shows full-stack ownership from UI to API to database
- It has a real user flow instead of isolated CRUD pages
- It includes basic business logic, not just storage
- It is small enough to explain clearly in a few minutes

## Good Tradeoffs To Mention

- I kept the architecture intentionally small so the full request flow is easy to follow
- I centralized API calls in one frontend utility file
- I used the database to enforce vote uniqueness instead of trusting only the frontend

## Possible Next Improvements

- Add validation on both frontend and backend
- Add tests for the main API endpoints
- Move the API base URL to an environment variable
- Add database transactions when creating polls and recording votes

## Common Interview Questions

### What was the hardest part?

Good answer:

> The main challenge was keeping the project simple without losing the full-stack story. I wanted enough real logic to show design decisions, like duplicate-vote protection, but not so much structure that it became harder to explain.

### Why did you keep the architecture so small?

Good answer:

> This project was meant to be easy to reason about end to end. By keeping the frontend to two pages and the backend to a small route-controller structure, I could explain the full request flow clearly and still show real engineering decisions.

### Why enforce duplicate-vote protection in the database?

Good answer:

> I didn’t want to rely only on frontend behavior, because users can bypass UI rules. The database is the most reliable place to enforce that business rule, so one username can only vote once per poll.

### What would you improve next?

Good answer:

> I’d add API tests, move all configuration into environment variables, and use transactions for multi-step writes like poll creation and vote recording.

### What does this project show about you as a developer?

Good answer:

> It shows that I can build a complete feature across frontend, backend, and database layers, and that I know how to keep a solution intentionally simple instead of adding complexity that doesn’t help the product.

### How would you scale this project if it grew?

Good answer:

> I’d start by adding tests and stronger validation, then separate concerns more formally if complexity increased, for example service layers, better error handling, and more robust database transaction management. I’d only add those once the project size justified them.

## Run Locally

From the project root:

```bash
npm run dev
```

Frontend runs through Vite and backend runs through Node at the same time.
