# base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY ./package.json ./package-lock.json /app/
RUN npm ci --unsafe-perm

# add app
COPY ./angular.json ./tsconfig.json /app/
COPY ./src /app/src
ADD https://phaenonet-test.web.app/__/firebase/init.json /app/src/local/

# start app
CMD npx ng serve -c local --host 0.0.0.0 --disable-host-check
