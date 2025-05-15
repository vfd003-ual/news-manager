# Build stage
FROM alpine:3.19 AS builder

# Instalar Node.js y herramientas de compilación
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    make \
    g++

WORKDIR /app

COPY package*.json ./
RUN npm install && \
    npm ci --production --legacy-peer-deps && \
    npm cache clean --force

COPY . .

# Production stage
FROM alpine:3.19

# Install Node.js runtime and curl for healthcheck, create user
RUN apk add --no-cache nodejs curl \
    && addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && mkdir -p /app \
    && chown -R appuser:appgroup /app

WORKDIR /app

# Copiar solo los archivos necesarios desde la etapa de build
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/server.js ./
COPY --from=builder --chown=appuser:appgroup /app/config ./config
COPY --from=builder --chown=appuser:appgroup /app/controllers ./controllers
COPY --from=builder --chown=appuser:appgroup /app/middleware ./middleware
COPY --from=builder --chown=appuser:appgroup /app/models ./models
COPY --from=builder --chown=appuser:appgroup /app/routes ./routes
COPY --from=builder --chown=appuser:appgroup /app/services ./services

# Cambiar al usuario no root
USER appuser

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]