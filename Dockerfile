# base image
FROM node:14

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm ci

# add app
COPY ./tsconfig.json /app/
COPY ./angular.json /app/
COPY ./src /app/src
ADD https://phaenonet-test.web.app/__/firebase/init.json /app/src/local/

# start app
CMD npx ng serve -c=local
