FROM node:14-alpine

WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# build the app
COPY . ./
RUN npm run build

ENTRYPOINT [ "npm", "run", "start:nobuild" ]
