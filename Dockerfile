FROM arm32v7/node:8.16
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run tsc
EXPOSE 3000
CMD [ "yarn", "start" ]