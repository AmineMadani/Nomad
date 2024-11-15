#!/bin/bash

ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
source "$ROOT_DIR/bin/common.sh"
GEOJSON_DIR="../geojson/"

#pgservicename=NEXT_CANOPE
. database.ini

CONNINFO="postgresql://${user}:${password}@${host}:${port}/${dbname}?sslmode=disable"
MAPTILE=$1
echo "-------------------------------------------"
echo "--->CONNINFO: $CONNINFO"
echo "--->TUILE: $1"
echo "--->GEOJSON DIR: $GEOJSON_DIR"
echo "-------------------------------------------"

# ############################################################################
# EXPORT TILE

LAYERS=$(echo "select lyr_table_name::text from nomad.layer " | psql -v ON_ERROR_STOP=1 -t $CONNINFO)
echo "---> EXPORTING:"

if [ ! -d "$GEOJSON_DIR" ]; then
  echo "Creating $GEOJSON_DIR dir."
	mkdir "$GEOJSON_DIR"
fi

if [ ! -d $GEOJSON_DIR"4326" ]; then
  echo "Creating $GEOJSON_DIR dir."
	mkdir "$GEOJSON_DIR"
fi

for l in ${LAYERS}; do \
	echo "-------> Layer $l...";
  GEOJSON=$(echo "select nomad.f_get_geojson_from_tile('$l', $MAPTILE)" | psql -v ON_ERROR_STOP=1 -t $CONNINFO)
  echo "$GEOJSON" > "$GEOJSON_DIR$l.geojson"
  ogr2ogr  "$GEOJSON_DIR/4326/$l.geojson" -t_srs "EPSG:4326" "$GEOJSON_DIR$l.geojson"
done
