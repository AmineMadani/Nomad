#!/bin/bash

if [[ "$OSTYPE" == "darwin"* ]]
then
    DIR="${1%/*}"
    (cd "$DIR" && echo "$(pwd -P)")
else
    readlink -m $1
fi
