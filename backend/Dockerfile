FROM node:26-alpine

RUN npm install -g pnpm

WORKDIR /app

ENV CI=true

# RUN apk add --no-cache bash curl

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 5000

# HEALTHCHECK --interval=5m --timeout=3s CMD curl -f http://localhost:5000 || exit 1

CMD ["pnpm", "run", "start:dev"]
