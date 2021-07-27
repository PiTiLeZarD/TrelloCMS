FROM node:16.5-alpine
LABEL maintainer="Jonathan Adami <pitilezard@gmail.com>"

COPY . /app
WORKDIR /app

RUN yarn install

ENTRYPOINT [ "yarn" ]
CMD [ "build" ]