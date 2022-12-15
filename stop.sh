#!/bin/bash

# stop all containers
# keeps key from trusted setup

set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

cd server 
docker-compose stop

cd ../contracts
docker-compose stop