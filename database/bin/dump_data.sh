#!/bin/bash

ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
source "$ROOT_DIR/bin/common.sh"
CONNINFO="service=VIGIE_NAT"
dumpschema="consolidated_data"
source "$ROOT_DIR/bin/common.sh"

echo "--->CONNINFO: ${CONNINFO}"

# ############################################################################
# dump consolidated data


# ############################################################################
# NO VERSION ==> FIRST INSTALL
logInfo "========== Exporting consolidated schema from $CONNINFO ..."

pg_dump "$CONNINFO" -t "^consolidated_data.ass*" -t "^consolidated_data.aep*" -t "^consolidated_data.config*"  -n ${dumpschema} > ../dump/condolidated_data_$(date '+%Y%m%d%H%M%S').dump

logInfo "========== End of treatment !"
