#!/bin/bash

ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
source "$ROOT_DIR/bin/common.sh"
backupfile=$1

#pgservicename=NEXT_CANOPE
. database.ini

CONNINFO="postgresql://${user}:${password}@${host}:${port}/${dbname}?sslmode=disable"
echo "--->CONNINFO: $CONNINFO"

# ############################################################################
# RESTORE SCHEMA DUMP
logInfo "========== Restore dump $backupfile from $CONNINFO ..."

psql ${CONNINFO} -f ${backupfile};

logInfo "========== End of treatment !"
