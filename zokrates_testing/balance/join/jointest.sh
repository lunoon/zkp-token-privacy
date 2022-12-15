#!/bin/bash

zokrates compile -i balance.zok

zokrates setup

# before: get values with hash.zok
# pre0/pre1
# 0 0 0 1
# 192679394205378567678278285373543227086 307780299564696270546142378206422684517
# post
# 0 0 0 2
# 252271580579035598686477258707305602725 174769770151424667328363489672503490848

zokrates compute-witness -a 192679394205378567678278285373543227086 307780299564696270546142378206422684517 192679394205378567678278285373543227086 307780299564696270546142378206422684517 252271580579035598686477258707305602725 174769770151424667328363489672503490848 1 1 2
#Computing witness...
#Witness file written to 'witness'

zokrates generate-proof
#Generating proof...
#WARNING: You are using the G16 scheme which is subject to malleability. See zokrates.github.io/toolbox/proving_schemes.html#g16-malleability for implications.
#Proof written to 'proof.json'

zokrates verify        
#Performing verification...
#PASSED