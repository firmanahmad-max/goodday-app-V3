# GoodDay API — Node HTTP, global fetch (node-fetch tak terpakai) → tanpa npm install.
# Frontend statis (docs/index.html) disajikan oleh Caddy; image ini backend saja.
FROM node:22-slim
WORKDIR /app
COPY package.json server.js ./
COPY api ./api
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
