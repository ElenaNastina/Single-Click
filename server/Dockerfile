FROM node:18.5

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm i

COPY . .

EXPOSE 3000

VOLUME /app/config

CMD [ "npm", "run" ]