FROM node:20.11.1-slim

# Crear usuario no root
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

# Instalar dependencias necesarias
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --production --legacy-peer-deps && \
    npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar propiedad de los archivos al usuario no root
RUN chown -R appuser:appgroup /app

# Cambiar al usuario no root
USER appuser

# Configurar variables de entorno
ENV NODE_ENV=production \
    PORT=3000

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Comando de inicio
CMD ["npm", "start"]