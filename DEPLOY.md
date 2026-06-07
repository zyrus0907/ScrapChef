# Deploying ScrapChef

The backend has a `render.yaml` blueprint that provisions the API **and** a
Postgres database on [Render](https://render.com) in a few clicks. Migrations
run automatically on every deploy.

## 1. Deploy the backend (Render)

1. Push this repo to GitHub (see bottom).
2. Go to **https://dashboard.render.com → New → Blueprint**.
3. Connect your GitHub account and pick the **ScrapChef** repo. Render reads
   `render.yaml` and shows two resources: `scrapchef-api` and `scrapchef-db`.
4. Click **Apply**. Render creates the database and builds the API from
   `backend/Dockerfile`.
5. When prompted, set the one secret it can't generate:
   - **GEMINI_API_KEY** = your free key from https://aistudio.google.com/app/apikey
   (`JWT_SECRET` is generated for you; the database vars are wired automatically.)
6. Wait for the deploy to go green. Your API is now at:
   **`https://scrapchef-api.onrender.com`** (Render shows the exact URL).
7. Sanity check: open `https://<your-api>.onrender.com/health` → `{"status":"ok"}`.

> Free tier notes: the API sleeps after ~15 min idle (first request after that
> is slow to wake), and the free Postgres is time-limited. Upgrade either to a
> paid instance for always-on / permanent data.

## 2. Point the app at your hosted API

The mobile app reads `EXPO_PUBLIC_API_URL`. Run it against the live backend:

```bash
cd mobile
EXPO_PUBLIC_API_URL=https://<your-api>.onrender.com/api/v1 npx expo start
```

(For a permanent build, set the same variable in `eas.json`'s build env.)

## 3. (Optional) Host the web app too

```bash
cd mobile
EXPO_PUBLIC_API_URL=https://<your-api>.onrender.com/api/v1 npx expo export --platform web
# then drag the generated `dist/` folder onto https://app.netlify.com/drop
```

## 4. (Optional) iPhone build

```bash
cd mobile
eas login            # free Expo account
eas build --profile preview --platform ios
```

`eas.json`'s `preview` profile bakes in `EXPO_PUBLIC_API_URL` — update it to your
Render URL first so the installed app talks to the hosted backend.

## Pushing to GitHub

```bash
git add -A && git commit -m "deploy config" || true && git push origin main
```
