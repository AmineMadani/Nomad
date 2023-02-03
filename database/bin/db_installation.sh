#!/bin/bash


ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
NEW_VERSION=0.0.0
source "$ROOT_DIR/bin/common.sh"
CONNINFO="service=NEXT_CANOPE"
SRID=3857

function usage() {
    [ -n "$1" ] && logError $*

    logInfo "Usage: $progname [--service SERVICE_NAME] [--srid SRID] [--version VERSION]"
    logInfo " --service SERVICE_NAME : nom du service postgresql à utiliser pour se connecter. Défaut : VIGIE"
    logInfo " --srid SRID : srid à utiliser pour les géométries. Défaut : 2154"
    logInfo " --migration_path PATH : chemin du répertoire pour les scripts de migration. Défaut : $ROOT_DIR/db/migration"
    logInfo " --version VERSION : version à déployer. Par défaut, utilise celle des métadata de la release."

    [ -z "$1" ] && exit 0 || exit 1
}

function install_all() {
    # db innstallation
    logInfo "Génération du sql..."

    #list of sql sources
    SQL_SOURCES="$ROOT_DIR/sql/drop_schemas.sql \
               $ROOT_DIR/sql/create_schemas.sql \
               $ROOT_DIR/sql/create_settings.sql \
               $ROOT_DIR/sql/create_config.sql"

    for s in ${SQL_SOURCES}
    do
        logInfo "Applying sql source $s ..."
        [ -f "$s" ] || failed "Fichier '$s' introuvable"
        psql -v ON_ERROR_STOP=1 -v srid=$SRID $CONNINFO < $s >/dev/null || failed "Impossible d'appliquer sql source '$s' !"
    done

    # MISE A JOUR DE LA VERSION
    logInfo "Mise à jour de la version..."
    echo "select settings.set_product_version('$NEW_VERSION')" | psql -v ON_ERROR_STOP=1 $CONNINFO >/dev/null || failed "Impossible de mettre à jour la version à '$NEW_VERSION' !"

}

### Parameters from command line
POSITIONAL=()
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        --service)
            CONNINFO="service=$2"
            shift # past argument
            shift # past value
            ;;

        --srid)
            SRID="$2"
            shift # past argument
            shift # past value
            ;;

        --version)
            NEW_VERSION="$2"
            shift # past argument
            shift # past value
            ;;

        --help|-h)
            usage
            ;;
        *)    # unknown option
            POSITIONAL+=("$1") # save it in an array for later
            shift # past argument
            ;;
    esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

[ -n "$NEW_VERSION" ] || usage "Pas de version cible définie. Utilisez --version ou une version issue d'une release."

logInfo "Paramètres :"
logInfo "\tBase directory='$ROOT_DIR'"
logInfo "\tDB connexion='$CONNINFO'"
logInfo "\tSRID=$SRID"
logInfo "\tNew version=$NEW_VERSION"


# ############################################################################
# Check db connection
echo "SELECT current_date" | psql -v ON_ERROR_STOP=1 $CONNINFO >/dev/null || failed "Impossible de se connecter à la base de donnée !"


# ############################################################################
# NO VERSION ==> FIRST INSTALL
logInfo "========== Installation de la base dans $CONNINFO ..."
install_all


logInfo "========== Terminé !"
