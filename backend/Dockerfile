# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.example ./.env
EXPOSE 3000
CMD ["node", "dist/main.js"]
