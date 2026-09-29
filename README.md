# Travories Brochure Service

Server-side PDF generation for package brochures. It is the single source of
truth for brochure layout and must be deployed privately or behind an internal
gateway.

## API

`POST /v1/package-brochures` accepts `{ package, party?, packageUrl? }` and
returns `application/pdf`. Callers must send the internal
`x-brochure-service-token` header. Never expose this token to a browser; the
frontend and admin applications should call it through authenticated server
routes.

## Environment

`BROCHURE_SERVICE_TOKEN` is required. `PORT` defaults to `3001`.

# brochures-travories

## Docker

Copy `.env.example` to `.env` and set `BROCHURE_SERVICE_TOKEN` and `PORT`, then:

```sh
docker compose up --build
```

Compose reads `.env` for both the container environment and the published
port. Without Compose:

```sh
docker build -t travories-brochures .
docker run --rm --env-file .env -p 3001:3001 travories-brochures
```

The image runs a single esbuild bundle (`npm run build` → `dist/server.mjs`)
on `node:22-slim` with the brochure fonts alongside it; no `node_modules` ship
in the final image.
