FROM node:current-alpine
EXPOSE 3000 3001 3002

ENV NODE_ENV=production

RUN mkdir /app
WORKDIR /app

RUN mkdir /app/services

COPY services /app/services
COPY docker_start.sh /app/docker_start.sh

CMD ["/bin/sh","./docker_start.sh"]
