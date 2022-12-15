# FROM zokrates/zokrates as development
# workdir /home/zokrates
FROM node:16.17.1 AS development

WORKDIR /opt/server
RUN npm update -g npm && chown node:node /opt/server
USER node
COPY --chown=node:node package.json package-lock.json ./
RUN npm clean-install
COPY --chown=node:node . .