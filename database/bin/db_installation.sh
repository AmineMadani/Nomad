#!/bin/bash

ROOT_DIR=`dirname $0`
ROOT_DIR=$($ROOT_DIR/readlink_wrapper.sh "$ROOT_DIR/../")
NEW_VERSION=0.0.0
source "$ROOT_DIR/bin/common.sh"

SRID=3857
ORGA=vef

#pgservicename=NEXT_CANOPE
. database.ini

CONNINFO="postgresql://${user}:${password}@${host}:${port}/${dbname}?sslmode=disable"
echo "--->CONNINFO: $CONNINFO"

function install_all() {
    # db innstallation
    logInfo "Génération du sql..."

    #list of sql sources
    SQL_SOURCES="$ROOT_DIR/sql/drop_schemas.sql \
               $ROOT_DIR/sql/create_schemas.sql \
               $ROOT_DIR/sql/create_functions.sql \
               $ROOT_DIR/sql/create_config.sql \
	       $ROOT_DIR/sql/create_triggers.sql \
               $ROOT_DIR/sql/create_views.sql "               

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
LAYER_FILE=../conf/layer_$ORGA.sql
ORGANIZATIONAL_UNIT_FILE=../conf/organizational_unit_$ORGA.sql
#LAYER_WO_PARAMS_FILE=../conf/wo_mngt_params_$ORGA.sql
echo $CONF_FILE


# Execute VEF
psql -v ON_ERROR_STOP=1 -v srid=$SRID -v prefix="$PREFIX" $CONNINFO < $CONF_FILE >/dev/null || failed "Impossible d'appliquer le script de conf '$CONF_FILE' !"
# Load .csv file into temporary table
psql $CONNINFO -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.temp_layer_references; CREATE TABLE public.temp_layer_references(lyr_table_name text, column_name text, alias_name text, data_type text, position text, display_type text, section text, notvisible text);" || logWarn "!! Impossible de construire table temp !!"
psql $CONNINFO -v ON_ERROR_STOP=1 -c "\copy public.temp_layer_references FROM '../conf/csv/modele_layer_reference.csv' WITH DELIMITER ';' QUOTE '\"' CSV HEADER;" || logWarn "!! Impossible de charger csv !!"
psql -v ON_ERROR_STOP=1 -v srid=$SRID $CONNINFO < $LAYER_FILE  >/dev/null || failed "Impossible de charger les préférences de LAYER'$CONF_FILE' !"
#psql -v ON_ERROR_STOP=1 -v srid=$SRID $CONNINFO < $LAYER_WO_PARAMS_FILE  >/dev/null || failed "Impossible de charger les paramètres de gestion des interventions '$LAYER_WO_PARAMS_FILE' !"
psql $CONNINFO -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.temp_layer_references; "
# Delete temp table
#psql $CONNINFO -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.temp_layer_references;" || logWarn "!! Impossible de construire table temp !!"
psql $CONNINFO -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.orga_data_tmp; CREATE TABLE public.orga_data_tmp(region text, territoire text, identifiant_technique text, code_contrat text, code_comptable text, libelle_court_contrat text, libelle_long_contrat text, date_deliberation_signature text, date_de_visa_en_prefecture text, date_effet_du_contrat text, date_echeance_du_contrat text, date_fin_exploitation text, date_echeance_max text, date_fermeture_comptable text, libelle_insee text, code_insee text, date_entree_commune text, date_de_sortie_commune text, adhesion text, pourcent_couv_eau_ac text, pourcent_couv_anc text, code_societe text, libelle_societe text, code_activite text, nature_juridique text, mode_de_gestion text);" || logWarn "!! Impossible de construire table orga_data_tmp !!"
psql $CONNINFO -v ON_ERROR_STOP=1 -c "\copy public.orga_data_tmp FROM '../conf/csv/rcc.csv' WITH DELIMITER ',' CSV" || logWarn "!! Impossible de charger csv !!"
psql -v ON_ERROR_STOP=1 -v srid=$SRID $CONNINFO < $ORGANIZATIONAL_UNIT_FILE >/dev/null || failed "Impossible de charger les entités organisationnels de '$ORGANIZATIONAL_UNIT_FILE' !"

logInfo "========== End of treatment !"
