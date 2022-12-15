#!/bin/bash

# remove all containers and volumes
# keeps key from trusted setup

set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

cd server 
docker-compose down --volumes

cd ../contracts
docker-compose down --volumes
