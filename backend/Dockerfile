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
# copy user management scripts
COPY --from=builder /app/create-user.js ./create-user.js
COPY --from=builder /app/create-admin.js ./create-admin.js
COPY --from=builder /app/seed-data.js ./seed-data.js

# Create directory for WhatsApp session files (Railway persistent storage)
RUN mkdir -p ./.wwebjs_auth && chmod 777 ./.wwebjs_auth

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]
