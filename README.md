# wtvision assignment — key-value item viewer/editor

A login-protected CRUD app for key-value items.

**Stack**: Django 5.2 + DRF + SimpleJWT + PostgreSQL 16 · React 19 (Vite) +
Redux Toolkit + SCSS modules (no component libraries) · Docker Compose.

---

## 1. How to run the project

Prerequisite: Docker Desktop.

```bash
git clone https://github.com/yashaur/legwork-crud-assignment.git
cd legwork-crud-assignment
docker compose up --build
```

On startup the backend container automatically applies migrations and creates
a **demo superuser `admin` / `admin`** (idempotent — safe on every restart).

Then load the fixture (first run only, or whenever you swap the JSON):

```bash
docker compose exec backend python manage.py seed_items
```

Open **http://localhost:5173** and log in as `admin` / `admin`.

**Seeding is deliberately manual.** The command is wipe-and-reload (that's
what makes it rerunnable), so running it automatically on every container
start would silently destroy edits made through the UI. To test a replacement
JSON: overwrite `data/items.json`, re-run the command above, refresh the
browser — no code changes or rebuilds needed.

The API is also reachable directly at `http://localhost:8000` (401 without a
token). Postgres data lives in the named volume `pgdata`, so
`docker compose down` followed by `up` preserves all data, including UI edits
(`docker compose down -v` is the destructive variant).

<details>
<summary>Running without containers (host mode)</summary>

```bash
docker compose up db          # Postgres only
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py seed_items
python manage.py runserver    # :8000
# separate shell:
cd frontend && npm install && npm run dev   # :5173
```

`.env` ships with `POSTGRES_HOST=localhost` for exactly this mode; the compose
file overrides it to `db` inside the network.
</details>

---

## 2. How the custom hook (`useApi`) works

`frontend/src/api/useApi.js` is the single owner of HTTP + auth mechanics.
Components and Redux thunks never call `fetch` for API data — they call the
hook's functions. (The one exception is the login page itself, which runs
before any token exists.)

**Shape.** Calling `useApi()` inside a component returns
`{ request, get, post, patch, del }` — five functions that close over the
current tokens (read from the Redux store) and `dispatch`. It must be a hook
because it needs `useSelector`/`useDispatch`; the functions it returns are
plain values, so a component can hand them to a thunk
(`dispatch(fetchItems(api))`), which is how thunks — which cannot call hooks —
still route all traffic through the hook.

**Request lifecycle:**

```
request(url, options)
  attach Authorization: Bearer <access>  (+ Content-Type, merged over caller headers)
  fetch
  ├─ status ≠ 401 ──────────────────────────────► shared exit
  └─ status = 401:
       POST /auth/token/refresh/ {refresh}      ← plain fetch, NO auth header
       ├─ refresh ok:
       │    dispatch setTokens (store + localStorage updated)
       │    RETRY the original request ONCE, using the token from the
       │    refresh RESPONSE BODY (not the stale closed-over one)
       │    ────────────────────────────────────► shared exit
       └─ refresh failed:
            dispatch logout  → ProtectedRoute redirects to /login
            reject

shared exit:   204 → null   ·   !ok → throw {status, body}   ·   else → parsed JSON
```

Details worth noting:

- **The retry is an inline second fetch, not recursion** — the code path can
  execute at most twice by construction, so a second 401 surfaces as an error
  instead of looping.
- **The refresh call carries no `Authorization` header**: the refresh token in
  the body is the credential, and an expired access token in the header would
  make SimpleJWT reject the request before reading the body.
- **Errors reject with `{status, body}`** (DRF's parsed error body), which the
  thunks store via `rejectWithValue` and the UI renders — e.g. field-level
  validation messages inside the edit modal.
- The logout-on-refresh-failure path needs no explicit redirect: clearing the
  auth state makes the route guard (`ProtectedRoute`, subscribed via
  `useSelector`) render a `<Navigate to="/login">` on its own.

**Verified behaviour**: with the access-token lifetime temporarily set to ~30
seconds, the Network tab shows the documented triple — original request (401),
refresh (200), retried request (200) — with the UI never noticing.

---

## 3. Assumptions made & design decisions

**Token storage.** Access + refresh tokens live in `localStorage` (for
survival across reloads) mirrored into Redux (for reactivity). Both are
readable by any JavaScript on the origin, so an XSS bug could exfiltrate them;
Redux is state management, not a security boundary. The production-grade
alternative — refresh token in an `httpOnly`/`Secure`/`SameSite` cookie with
the access token held in memory only — trades that exposure for CSRF handling
and backend cookie support, and was considered out of scope here. Bearer
headers are inherently CSRF-immune (nothing attaches them automatically), and
transport interception is TLS's job, not the storage layer's.

**Deliberately demo-only security.** `.env` is committed on purpose
([BE][BONUS-4] asks for it): it contains the `SECRET_KEY` that signs the JWTs.
`DEBUG=True`, `admin`/`admin` demo credentials auto-created on container
start, and no token revocation (a JWT stays valid until `exp`; SimpleJWT's
`token_blacklist` app would be the production answer). None of this is how a
real deployment would look.

**Seed command policy.** `seed_items` validates each entry: non-dict entries
and entries missing `key`/`value` are skipped and counted; over-long keys are
truncated to 50 chars rather than rejected; dict/list values are stored as
JSON strings. The whole load runs in one transaction — if every row is bad,
it rolls back rather than leaving an emptied table.

**DELETE returns `200` with the deleted item** instead of the conventional
bare `204` — a deliberate `destroy()` override (a 204 cannot carry a body per
the HTTP spec). The `useApi` hook still handles `204` defensively.

**Blank-value quirk.** The fixture may contain `""` values; the seed command
inserts them (model-level, unvalidated), but DRF's serializer rejects writing
a blank `value` back through PATCH ("This field may not be blank"). The edit
modal surfaces that message inline. Left as-is and documented rather than
loosening the serializer.

**Dev servers inside the containers.** Compose runs Vite's dev server and
Django's `runserver` with bind-mounted source, because the evaluation loop
(swap JSON, re-seed, tweak, observe) is a development loop — autoreload works
end to end. The production path is known and skipped as out of scope:
multi-stage build (Vite build → nginx serving `dist/` with `proxy_pass` for
`/api`+`/auth` and an SPA fallback) in front of gunicorn — the backend image's
default CMD is already gunicorn; compose overrides it for dev.

**Other notes.**

- The UI hard-codes no field names other than `key`/`value` (the two the
  assignment defines): the card destructures those and renders every remaining
  field via `Object.entries`, so a replacement JSON renders unchanged.
- Auth endpoints sit at exactly `/auth/token/` and `/auth/token/refresh/`
  (not under `/api/`), per the assignment.
- `authSlice` reducers write to `localStorage` directly — a knowing trade of
  reducer purity for having store and storage change in exactly one place.
- Concurrent 401s can trigger parallel refreshes (no single-flight lock);
  with refresh-token rotation off, both succeed and the race is harmless.
- The route guard is UX only; the API's global `IsAuthenticated` is the actual
  security boundary.

**Additional features beyond the brief**: logout button, loading/error/empty
states throughout (spinner component, inline field errors in the edit modal),
auto-migrate + auto-superuser on container start.

---

## Bonus checklist

| Bonus | Status |
|---|---|
| [BONUS-1] Next + TypeScript | Skipped — plain React/JS by design |
| [BONUS-2] PostgreSQL | ✔ Postgres 16 (alpine) |
| [BONUS-3] docker-compose + persistent volumes | ✔ three services, `pgdata` named volume |
| [BONUS-4] committed `.env` | ✔ intentional (see security notes above) |
| [FE] Redux state management | ✔ Redux Toolkit — `auth` + `items` slices, async thunks |
| [FE] Unit tests for the hook | Skipped |

## API summary

| Method | Path | Auth |
|---|---|---|
| POST | `/auth/token/` | — |
| POST | `/auth/token/refresh/` | — (refresh token in body) |
| GET/POST | `/api/items/` | Bearer |
| GET/PUT/PATCH/DELETE | `/api/items/{id}/` | Bearer |
