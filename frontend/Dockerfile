FROM node:20.11.1-alpine3.19 as builder

# Crear usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación SSR
RUN npm run build && npm run build:server

# Etapa de producción
FROM node:20.11.1-alpine3.19

# Crear usuario no root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copiar archivos built y dependencias
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package*.json ./

# Instalar solo dependencias de producción y limpiar caché
RUN npm ci --production --legacy-peer-deps && \
    npm cache clean --force

# Cambiar propiedad de los archivos al usuario no root
RUN chown -R appuser:appgroup /app

# Cambiar al usuario no root
USER appuser

# Configurar variables de entorno y exponer puerto
ENV PORT=4000 \
    NODE_ENV=production

EXPOSE 4000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1

CMD ["node", "dist/news-manager/server/server.mjs"]