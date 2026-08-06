# Dev image for the Vite/React frontend (ARCHITECTURE §7.2).
FROM node:20-alpine

WORKDIR /app

# Manifests first — npm install stays cached until dependencies change.
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# --host binds 0.0.0.0 so the published port is reachable from the Mac.
CMD ["npm", "run", "dev", "--", "--host"]
