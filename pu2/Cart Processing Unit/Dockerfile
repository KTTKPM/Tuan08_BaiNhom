# ─── Stage 1: Build / Install dependencies ───────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files trước (tận dụng Docker layer cache)
COPY package*.json ./

# Cài production dependencies
RUN npm ci --omit=dev

# ─── Stage 2: Production image ───────────────────────────
FROM node:20-alpine AS runner

# Cài thêm dumb-init để xử lý signal đúng cách trong container
RUN apk add --no-cache dumb-init

# Tạo user không có quyền root (bảo mật)
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001

WORKDIR /app

# Copy deps từ stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodeapp:nodejs src/ ./src/
COPY --chown=nodeapp:nodejs package*.json ./

# Chuyển sang user non-root
USER nodeapp

# Port expose
EXPOSE 8082

# Dùng dumb-init để handle PID 1 + signals đúng cách
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/app.js"]