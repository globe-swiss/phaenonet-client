FROM mcr.microsoft.com/playwright:bionic 

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends wait-for-it 

RUN npm install -g --allow-root --unsafe-perm=true codeceptjs@2.6.11 playwright@^1 mochawesome mocha

WORKDIR /tests

ENTRYPOINT ["codeceptjs"]
CMD ["run"]
