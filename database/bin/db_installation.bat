cls
REM INSTALL DB
set PATH=%PATH%;C:\Program Files\pgAdmin 4\v5\runtime
REM Including .ini file
for /f "delims=" %%x in (.\database.ini) do (set "%%x")
setx PGPASSWORD "%password%"

echo Install DB...
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/drop_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_config.sql -v srid=3857
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_functions.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_triggers.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_views.sql

echo Set config for VEF...
 psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/conf_vef.sql
 psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.temp_layer_references; CREATE TABLE public.temp_layer_references(lyr_table_name text, column_name text, alias_name text, data_type text, position text, display_type text, section text, notvisible text);" || logWarn "!! Impossible de construire table temp !!"
 psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "\copy public.temp_layer_references FROM '../conf/csv/modele_layer_reference.csv' WITH DELIMITER ';' QUOTE '\"' CSV HEADER;" || logWarn "!! Impossible de charger csv !!"
 psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/layer_vef.sql
 psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.orga_data_tmp; CREATE TABLE public.orga_data_tmp(region text, territoire text, identifiant_technique text, code_contrat text, code_comptable text, libelle_court_contrat text, libelle_long_contrat text, date_deliberation_signature text, date_de_visa_en_prefecture text, date_effet_du_contrat text, date_echeance_du_contrat text, date_fin_exploitation text, date_echeance_max text, date_fermeture_comptable text, libelle_insee text, code_insee text, date_entree_commune text, date_de_sortie_commune text, adhesion text, pourcent_couv_eau_ac text, pourcent_couv_anc text, code_societe text, libelle_societe text, code_activite text, nature_juridique text, mode_de_gestion text);" || logWarn "!! Impossible de construire table orga_data_tmp !!"
 psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "\copy public.orga_data_tmp FROM '../conf/csv/rcc.csv' WITH DELIMITER ',' CSV" || logWarn "!! Impossible de charger csv !!"
 psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/organizational_unit_vef.sql
 echo End of treatment
pause
