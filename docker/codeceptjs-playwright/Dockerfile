FROM mcr.microsoft.com/playwright:bionic 

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends wait-for-it 

WORKDIR /tests

RUN npm install codeceptjs@2.6.11 playwright@^1 mochawesome mocha

ENTRYPOINT ["npx", "codeceptjs"]
CMD ["run"]

