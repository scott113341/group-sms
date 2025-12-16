FROM node:24-alpine

COPY package.json package-lock.json ./
RUN npm ci
COPY . ./

CMD ["node", "index.js"]
