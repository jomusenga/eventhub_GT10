FROM node:25-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:25-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3002

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
