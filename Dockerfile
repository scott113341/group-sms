FROM node:18-alpine

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./

CMD ["node", "index.js"]
