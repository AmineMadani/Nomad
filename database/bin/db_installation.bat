REM INSTALL DB
set PATH=%PATH%;C:\Program Files\pgAdmin 4\v5\runtime
REM Including .ini file
for /f "delims=" %%x in (.\database.ini) do (set "%%x")
setx PGPASSWORD %password%
echo Install DB...
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/drop_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_schemas.sql
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../sql/create_config.sql
echo Set config for VEF...
psql -h %host% -d %dbname% -U %user% -p %port% -b -q -f ../conf/conf_vef.sql
echo End of treatment
pause
