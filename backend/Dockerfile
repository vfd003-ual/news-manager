FROM node:20.11.1-slim
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci --production --legacy-peer-deps && \
    npm cache clean --force
COPY . .
RUN chown -R appuser:appgroup /app
USER appuser
ENV NODE_ENV=production \
    PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["npm", "start"]