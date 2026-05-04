FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S appuser -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chown -R appuser:nodejs /app

USER appuser
EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8081/products').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

CMD ["npm", "start"]
