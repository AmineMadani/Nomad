update nomad.layer set lyr_interactive='ALL';
update nomad.layer set lyr_interactive='NONE' where lyr_table_name in ('aep_etage_de_pression','aep_emprise_ouvrage','aep_secteur');