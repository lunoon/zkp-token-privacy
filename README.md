# README

## project structure

* ### zokrates

  * contains files for setting up zero knowledge programs (trusted setup)
  * out folder contains generated files (mounted by server in docker compose)
  * generates keypairs and verifier contract for use in contracts and server
  * run setup only once otherwise you need to start over and destroy access to generated zkp as keypairs used come from different trusted setup

* ### contracts

  * deployment of smart contracts
  * ganache blockchain for testing
  * deployment script to deploy contract for confidentialregistry and verifier
  * docker-compose for ganache and deployment (run-once) with truffle
  * ganache is run in deterministic mode

* ### server

  * backend for accessing blockchain
  * generates zkp
  * communicates with database

---
![](../latex_eng/Images/system_view.png)
---

## prerequisites

* docker
* a good CPU
* about 7 GB of RAM reserved for docker
* docker/docker-compose (run server/database)
* node.js (used for scripts)
* npm (install dependencies)
* postman (use with postman collection)

| requirement    | tested version                         |
| -------------- | -------------------------------------- |
| docker         | docker version 20.10.14, build a224086 |
| docker-compose | version 1.29.2, build 5becea4c         |
| node           | v18.7.0                                |
| npm            | 8.18.0                                 |
| postman        | 10.5.2                                 |

setup of local environment:

1. ```npm i``` in project folder
2. zokrates:
    * create folder ```mkdir out```
    * generate setup:  ```node with_salt/setup_keys.js```
3. contracts:
    * ```docker-compose up -d```
4. wait until bootstrap container has exited and written the config file to server/export/config.env
5. ```npm i``` in server folder
6. server: build server image and pull postgres image
    * run ```docker-compose up -d```

! alternatively, you can use the bash scripts create, start, stop and remove (run before ```npm i``` in contracts and server to install npm dependencies)

! best is to use postman collection which displays information about requests/response  

! for ease of use it is recommended to use the scripts invoked with ```node <scriptName.js>```

using the enviroment:

1. zokrates: perform trusted setup (use create.sh or in zokrates: node with_salt/setup_keys.js)
2. use start.sh or run first ```docker-compose up -d``` in contracts and then ```docker-compose up -d``` in server
3. use registry api either with postman collection or scripts in scripts folder
