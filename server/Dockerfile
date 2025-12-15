FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose API and WebSocket ports
EXPOSE 3001
EXPOSE 1234

CMD ["npm", "start"]
