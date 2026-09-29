# syntax=docker/dockerfile:1

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-slim
ARG PORT=3001
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=${PORT}
WORKDIR /app
# The server resolves fonts relative to the working directory.
COPY assets/fonts ./assets/fonts
COPY --from=build /app/dist/server.mjs ./dist/server.mjs
USER node
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "dist/server.mjs"]
