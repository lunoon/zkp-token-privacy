FROM node:16.17.1

RUN npm update --location=global npm \
  && npm install --location=global truffle@5.5.12

WORKDIR /opt/zk-contracts

RUN chown node:node /opt/zk-contracts

USER node

COPY --chown=node:node package.json package-lock.json ./

RUN npm ci

COPY --chown=node:node . .