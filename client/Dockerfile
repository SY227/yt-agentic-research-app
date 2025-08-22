--------------------------------------------------
# Build
FROM node:20-alpine AS builder
WORKDIR /app
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
COPY package*.json ./
RUN npm i
COPY tsconfig.json vite.config.ts index.html nginx.conf ./
COPY src ./src
RUN npm run build

# Run (nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


