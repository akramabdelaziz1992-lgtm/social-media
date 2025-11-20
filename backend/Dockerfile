# Backend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

COPY package*.json ./
# install only production deps
RUN npm install --production

# copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]
