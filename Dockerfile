FROM node:latest

WORKDIR /app

ADD ./app

RUN npm install

EXPOSE 3500

CMD npm start