#!/bin/sh

list_of_env="dev int rec for prd"

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

build_flavor="$(echo "$build_environment" | sed 's/.*/\u&/')"

export PATH=/workspace/tools/gradle-8.4/bin:$PATH
export PATH=/workspace/tools/kotlinc/bin:$PATH
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH

unset https_proxy
unset http_proxy



apksigner verify --print-certs apk/nomad-rec-release.apk
