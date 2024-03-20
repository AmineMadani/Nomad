#!/usr/bin/env bash

# exit when any command fails
set -e


for ARGUMENT in "$@"
do

  KEY=$(echo $ARGUMENT | cut -f1 -d=)
  OPTARG=$(echo $ARGUMENT | cut -f2 -d=)

  case "$KEY" in
    env)         env="${OPTARG}"
    ;;
    component)   component="${OPTARG}"
    ;;
    version)     version="${OPTARG}"
    ;;
    aws_region)  aws_region="${OPTARG}"
    ;;
    aws_account) aws_account="${OPTARG}"
    ;;
    aws_bucket)  aws_bucket="${OPTARG}"
    ;;
    jar_name)    jar_name="${OPTARG}"
    ;;
    \?) echo "Invalid option -${OPTARG}" >&2
    ;;
  esac


done

if [ "$env" = "prd" ]; then
awsprofile="--profile prod"
else
awsprofile=""
fi


aws ecr get-login-password --region eu-west-3 $awsprofile | sudo docker login --username AWS --password-stdin ${aws_account}.dkr.ecr.eu-west-3.amazonaws.com
sudo docker rmi -f "patrimoine-nomad-${env}:${component}-${version}"  || echo OK
sudo docker build --rm  --no-cache -t "patrimoine-nomad-${env}:${component}-${version}" .
sudo docker tag "patrimoine-nomad-${env}:${component}-${version}" "${aws_account}.dkr.ecr.${aws_region}.amazonaws.com/patrimoine-nomad-${env}:${component}-${version}"
sudo docker push "${aws_account}.dkr.ecr.${aws_region}.amazonaws.com/patrimoine-nomad-${env}:${component}-${version}"
sudo docker tag "patrimoine-nomad-${env}:${component}-${version}" "${aws_account}.dkr.ecr.${aws_region}.amazonaws.com/patrimoine-nomad-${env}:${component}-current"
sudo docker push "${aws_account}.dkr.ecr.${aws_region}.amazonaws.com/patrimoine-nomad-${env}:${component}-current"

