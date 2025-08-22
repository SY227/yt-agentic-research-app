--------------------------------------------------
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
# trim to production deps (drops devDependencies)
RUN npm prune --omit=dev

# Run stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# for healthcheck
RUN apk add --no-cache curl
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]


