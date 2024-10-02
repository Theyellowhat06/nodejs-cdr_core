FROM node:21
WORKDIR /Projects/cdr
COPY . .
ENV NODE_PATH=./src
RUN npm install --omit=dev
RUN npm uninstall bcrypt
EXPOSE 3050
CMD ["pm2-runtime", "server/server.js"]