FROM node:lts-alpine
LABEL 'maintainer'='omar' 
WORKDIR /app
COPY ./package*.json ./
RUN yarn install --prod
COPY . /app
EXPOSE 4000
CMD [ "yarn", "build" ]