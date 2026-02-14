FROM node:20-alpine

WORKDIR /app

# Install backend deps first (better layer caching)
COPY Backend/package.json Backend/package-lock.json* ./Backend/
RUN cd Backend && npm install --omit=dev

# Copy the app (backend + frontend assets)
COPY Backend ./Backend
COPY Frontend ./Frontend

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "Backend/server.js"]
