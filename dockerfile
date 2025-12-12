# syntax=docker/dockerfile:1

########################
# Étape 1 : Build Angular
########################
FROM node:16.20-alpine AS build
WORKDIR /app

# Copie des manifests d'abord (cache)
COPY package*.json ./

# Tente npm ci (si lock OK), sinon fallback sur npm install
RUN set -eux; \
  if [ -f package-lock.json ]; then \
    npm ci || (rm -rf node_modules && npm install --legacy-peer-deps); \
  else \
    npm install --legacy-peer-deps; \
  fi

# Copie du reste du code
COPY . .

# Build de prod avec la CLI 13
RUN npx --yes @angular/cli@13.3.10 build --configuration production

########################
# Étape 2 : Nginx pour servir le build
########################
FROM nginx:1.25-alpine

# Config SPA (fallback sur index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ Si ton projet Angular a un autre nom, adapte "sahera" ci-dessous
COPY --from=build /app/dist/sahera /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
