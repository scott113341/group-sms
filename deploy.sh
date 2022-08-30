#!/usr/bin/env bash

REGISTRY=registry.digitalocean.com/scott-do-sfo3-registry
NAME=group-sms

docker build -t $REGISTRY/$NAME .
docker push $REGISTRY/$NAME
