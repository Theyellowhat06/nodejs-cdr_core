FROM node:21
WORKDIR /Projects/cdr
COPY . .
RUN npm install --omit=dev
RUN npm install pm2 -g --omit=dev
EXPOSE 3050
CMD ["pm2-runtime", "server/server.js"]