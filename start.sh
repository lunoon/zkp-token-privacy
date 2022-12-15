#!/bin/bash

# use this when you have completed trusted setup
# start containers

cd "$(dirname "${BASH_SOURCE[0]}")"

if [ "$( docker container inspect -f '{{.State.Status}}' zk-ganache )" == "running" ]; then
  cd server && docker-compose up -d
  cd ..
elif [ "$( docker container inspect -f '{{.State.Status}}' zk-ganache )" == "exited" ]; then
  cd contracts && docker-compose up -d zk-ganache
  cd ../server && docker-compose up -d
  cd ..
else
  cd contracts && docker-compose up -d
  cd ../server && docker-compose up -d
  cd ..
fi

# import postman collection 
# create: zkp -> registry 
# transfer: registry
# split/join: (registry ->) zkp -> registry
# open shell to project/script 
# docker run --rm -it --name zk-proj --network="host" -v $(pwd):/opt/proj -u $(id -u) -w /opt/proj -e HOME=/tmp/ node bash
# not tested yet