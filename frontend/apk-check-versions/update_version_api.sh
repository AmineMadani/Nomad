#!/bin/sh

list_of_env="dev int rec rec2 for prd"

if [ $# -eq 0 ]
  then
    echo "Aucun argument est passe !"
    exit 1
fi


exists_in_list() {
    LIST=$1
    DELIMITER=$2
    VALUE=$3
    LIST_WHITESPACES=`echo $LIST | tr "$DELIMITER" " "`
    for x in $LIST_WHITESPACES; do
        if [ "$x" = "$VALUE" ]; then
            return 0
        fi
    done
    return 1
}

if exists_in_list "$list_of_env" " " $1; then
    echo "Build des APKs de l'environnement $1 est en cours  ..."
else
    echo "$1 n'est pas un environnement reconnu !"
    exit 1
fi
build_environment=$1

unset https_proxy
unset http_proxy

if [ ${build_environment} = 'prd' ]
then
   build_env_api=""
else
   build_env_api=".${build_environment}"
fi

aws s3api put-object --bucket veolia-mobilite-deploiement-prd --key com.veolia.nomad${build_env_api}  --body   com.veolia.nomad${build_env_api}  --content-type application/json --acl public-read  --profile prod
