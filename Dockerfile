FROM node:18.20-alpine3.19 AS build-stage

WORKDIR /app

COPY package.json .

RUN npm install pnpm -g

RUN pnpm install

COPY . .

RUN pnpm run build

# production stage
FROM node:18.20-alpine3.19 AS production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm install pnpm -g

RUN pnpm install --production

EXPOSE 3000

CMD ["npx", "cross-env", "NODE_ENV=production", "node", "main.js"]
