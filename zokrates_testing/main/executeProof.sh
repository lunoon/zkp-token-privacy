#!/bin/bash

zokrates compute-witness -a 0 0 0 5 263561599766550617289250058199814760685 65303172752238645975888084098459749904

# Computing witness...
# Witness file written to 'witness'
zokrates generate-proof

# Generating proof...
# WARNING: You are using the G16 scheme which is subject to malleability. See zokrates.github.io/toolbox/proving_schemes.html#g16-malleability for implications.
# Proof written to 'proof.json'
zokrates verify
# Performing verification...
# PASSED