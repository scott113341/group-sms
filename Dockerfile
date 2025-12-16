FROM node:25-alpine

COPY package.json package-lock.json ./
RUN npm ci
COPY . ./

CMD ["node", "index.js"]
