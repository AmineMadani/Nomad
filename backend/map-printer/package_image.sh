#!/usr/bin/env bash

set -e

./create_image.sh env="dev"  component="map-printer"  version="v1.0.0"  aws_region="eu-west-3"  aws_account="883029375205"
./create_image.sh env="rec"  component="map-printer"  version="v1.0.0"  aws_region="eu-west-3"  aws_account="883029375205"
./create_image.sh env="rec2"  component="map-printer"  version="v1.0.0"  aws_region="eu-west-3"  aws_account="883029375205"
./create_image.sh env="for"  component="map-printer"  version="v1.0.0"  aws_region="eu-west-3"  aws_account="883029375205"
exit 0
./create_image.sh env="int"  component="map-printer"  version="v1.0.0"  aws_region="eu-west-3"  aws_account="883029375205"



