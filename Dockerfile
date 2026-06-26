FROM node:20-alpine

WORKDIR /app

# Copia apenas os manifestos de dependências primeiro para aproveitar o cache.
COPY package.json package-lock.json ./

RUN npm install --production

# Copia o código da API
COPY backend ./backend

WORKDIR /app/backend

EXPOSE 5000

CMD ["node", "src/server.js"]
