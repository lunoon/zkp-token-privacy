#!/bin/bash

# run trusted setup once
# runs npm for scripts and zokrates, creates out folder and performs trusted setup

set -e

cd "$(dirname "${BASH_SOURCE[0]}")"

docker run --rm --name zk-proj -v $(pwd):/opt/proj -u $(id -u) -w /opt/proj -e HOME=/tmp/ node bash && npm i && cd /opt/proj/zokrates/ && mkdir out &&  node with_salt/setup_keys.js
