REM INSTALL DB
set PATH=%PATH%;C:\Program Files\pgAdmin 4\v5\runtime
REM Including .ini file
for /f "delims=" %%x in (.\database.ini) do (set "%%x")
setx PGPASSWORD=%password%

echo Install DB...
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/drop_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_config.sql -v srid=3857
rem psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_functions.sql
rem psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_views.sql

echo Set config for VEF...
rem psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/conf_vef.sql
rem psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "DROP TABLE if exists public.temp_layer_references; CREATE TABLE public.temp_layer_references(lyr_table_name text, column_name text, alias_name text, data_type text, position text, display_type text, section text, notvisible text);" || logWarn "!! Impossible de construire table temp !!"
rem psql -h %host% -d %dbname% -U %user% -p %port% -v ON_ERROR_STOP=1 -c "\copy public.temp_layer_references FROM '../conf/csv/modele_layer_reference.csv' WITH DELIMITER ';' QUOTE '\"' CSV HEADER;" || logWarn "!! Impossible de charger csv !!"
rem psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/layer_vef.sql
echo Set exploitation mock data...
rem psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/mock_exploitation.sql
echo End of treatment
pause
