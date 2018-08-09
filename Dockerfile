FROM arm32v7/node:8.11
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run tsc
EXPOSE 3000
CMD [ "npm", "start" ]