FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD ["sh", "-c", "PORT=${FRONTEND_PORT:-3000} npm start"]