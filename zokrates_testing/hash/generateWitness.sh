#!/bin/bash

# max balance 340282366920938463463374607431768211455 (2**255)

zokrates compile -i hash.zok

zokrates compute-witness -a 0 0 0 5