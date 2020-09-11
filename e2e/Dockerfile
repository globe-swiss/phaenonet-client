FROM mcr.microsoft.com/playwright:bionic 

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends wait-for-it 

WORKDIR /tests

# add `/app/node_modules/.bin` to $PATH
ENV PATH /tests/node_modules/.bin:$PATH

# install and cache app dependencies
COPY ./package.json ./package-lock.json /tests/
RUN npm ci --only=prod

# add app
COPY ./codecept.conf.js /tests/
COPY ./src /tests/src

ENTRYPOINT ["wait-for-it", "phaenonet-app:4200", "-t", "120", "--", "npx", "codeceptjs"]

CMD ["run", "--override", "{ \"helpers\": { \"Playwright\": { \"url\": \"http://phaenonet-app:4200\" }}}", "--reporter", "mochawesome"]
