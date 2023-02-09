#!/bin/bash

ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
NEW_VERSION=0.0.0
source "$ROOT_DIR/bin/common.sh"

SRID=3857
ORGA=vef

pgservicename=NEXT_CANOPE
pgserviceexport $pgservicename /database.ini

CONNINFO="postgresql://${user}:${password}@${host}:${port}/${dbname}?sslmode=disable"

function install_all() {
    # db innstallation
    logInfo "Génération du sql..."

    #list of sql sources
    SQL_SOURCES="$ROOT_DIR/sql/drop_schemas.sql \
               $ROOT_DIR/sql/create_schemas.sql \
               $ROOT_DIR/sql/create_config.sql"

    for s in ${SQL_SOURCES}
    do
        logInfo "Applying sql source $s ..."
        [ -f "$s" ] || failed "File '$s' not found"
        psql -v ON_ERROR_STOP=1 -v srid=$SRID -v prefix="$PREFIX" $CONNINFO < $s >/dev/null || failed "Impossible d'appliquer sql source '$s' !"
    done
}


# ############################################################################
# Check db connection
echo "SELECT current_date" | psql -v ON_ERROR_STOP=1 $CONNINFO >/dev/null || failed "Impossible de se connecter à la base de donnée !"


# ############################################################################
# NO VERSION ==> FIRST INSTALL
logInfo "========== Database setup from $CONNINFO ..."
echo "$PREFIX_config"
install_all

logInfo "========== Config of $ORGA ..."
# apply custom scripts if any
CONF_FILE=../conf/conf_$ORGA.sql
echo $CONF_FILE

psql -v ON_ERROR_STOP=1 -v srid=$SRID -v prefix="$PREFIX" $CONNINFO < $CONF_FILE >/dev/null || failed "Impossible d'appliquer le script de conf '$CONF_FILE' !"


logInfo "========== End of treatment !"
