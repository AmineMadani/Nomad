set search_path to nomad, public;

-- Snapping tolerance of the underlying model, in map units
insert into float_setting values ('topo.snap_tolerance', 0.05 );

-- Set SRID
insert into text_setting values ('srid', 3857::integer);

-- insert raster Layer
insert into basemaps (alias, type, url, layer, matrixset, format, projection, tilegrid, style, attributions, "default", display)
values
('OpenStreetMap',
 'OSM',
 null, -- 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
 null,
 null,
 null,
 null, --'EPSG:3857
 null,
 null,
 null,
 True,
 True),
-----------------
('Orthophotoplan IGN',
 'WMS',
 'https://wxs.ign.fr/essentiels/geoportail/wmts',
 'ORTHOIMAGERY.ORTHOPHOTOS',
 'PM',
 'image/jpeg',
 'EPSG:3857',
 'tileGrid',
 'normal',
 '<a href="https://www.ign.fr/" target="_blank">' || chr(13) ||
 '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l''information géographique et forestière" alt="IGN"></a>',
 False,
 True),
-----------------
('Plan IGN',
 'WMS',
 'https://wxs.ign.fr/essentiels/geoportail/wmts',
 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
 'PM',
 'image/png',
 'EPSG:3857',
 'tileGrid',
 'normal',
 '<a href="https://www.ign.fr/" target="_blank">' || chr(13) ||
 '<img src="https://wxs.ign.fr/static/logos/IGN/IGN.gif" title="Institut national de l''information géographique et forestière" alt="IGN"></a>',
 False,
 True)
;

-- insert into domain

insert into domain
  ( type    , parent_type,   alias             , short)
  values
  ( 'asset' , NULL       , 'Patrimoine'        , 'PAT'   ),
    ( 'dw'  , 'asset'    , 'Eau Potable'       , 'AEP'   ),
    ( 'ww'  , 'asset'    , 'Assainissement'    , 'ASS'   ),
  ( 'wo'    , NULL       , 'Intervention'      , 'INT'   ),
  ( 'geo'   , NULL       , 'Périmètre'         , 'GEO'   )
;

-- insert into tree
insert into tree
  ( id, domain_type    , parent_id , Alias)
  values
  (   1   , 'geo'    , NULL  , 'Admin/Orga'),
  ---
  ( 100   , 'dw'    , NULL    , 'Réseau Eau Potable'),
    ( 101 , 'dw'    , 100     , 'Unités Fonctionnelles'),
    ( 102 , 'dw'    , 100     , 'Ouvrages'),
    ( 103 , 'dw'    , 100     , 'Equipements'),
    ( 106 , 'ww'    , 100     , 'Vannes'),
    ( 104 , 'dw'    , 100     , 'Branchements'),
    ( 105 , 'dw'    , 100     , 'Canalisations'),
  ---
  ( 200   , 'ww'    , NULL    , 'Réseau Assainissement'),
    ( 201 , 'ww'    , 200     , 'Unités Fonctionnelles'),
    ( 202 , 'ww'    , 200     , 'Ouvrages'),
    ( 203 , 'ww'    , 200     , 'Equipements'),
    ( 204 , 'ww'    , 200     , 'Branchements'),
    ( 205 , 'ww'    , 200     , 'Collecteurs')
  ---
;

update tree set num_order = id ;


insert into asset_type(domain_type, code, alias ) values
  ('dw','20', 'Canalisation AEP')
, ('dw','21', 'Branchemment AEP')
, ('dw','22', 'Ouvrages AEP')
, ('dw','23', 'Vannes AEP')
, ('dw','24', 'Equipement Incendie')
, ('dw','25', 'Equipement de Comptage')
, ('dw','26', 'Autre Equipement AEP')
, ('dw','27', 'Equipement de Régulation')
, ('dw','28', 'Multi-patrimoine AEP') -- FIXME
, ('dw','29', 'X, Y, Adresse AEP')
--------------------------------------------
, ('ww','30', 'Collecteur')
, ('ww','31', 'Branchement ASST')
, ('ww','32', 'Ouvrages ASST')
, ('ww','33', 'Avaloir')
, ('ww','34', 'Regard')
, ('ww','35', 'Autre équipement ASST')
, ('dw','38', 'Multi-patrimoine ASST') -- FIXME
, ('ww','39', 'X, Y, Adresse ASST')
;

insert into layer
(
    domain_type
  , tree_group_id
  , simplified_tree_group_id
  , lyr_table_name
  , lyr_schema_name
  , geom_column_name
  , uuid_column_name
  , geom_srid
  , alias
  , asset_type
)
values

  ( 'dw' ,  102, 102, 'aep_ouvrage', 'asset', 'geom', 'uuid', '3857', 'Ouvrage', '22')
, ( 'dw' ,  103, 103, 'aep_equipement', 'asset', 'geom', 'uuid', '3857', 'Equipement', '26')
, ( 'dw' ,  106, 104, 'aep_vanne_de_branche', 'asset', 'geom', 'uuid', '3857', 'Vanne de branchement', '26')
, ( 'dw' ,  106, 103, 'aep_vanne', 'asset', 'geom', 'uuid', '3857', 'Vanne', '23')
, ( 'dw' ,  103, 103, 'aep_compteur', 'asset', 'geom', 'uuid', '3857', 'Compteur', '25')
, ( 'dw' ,  103, 103, 'aep_regulation', 'asset', 'geom', 'uuid', '3857', 'Regulateur', '27')
, ( 'dw' ,  103, 103, 'aep_purge', 'asset', 'geom', 'uuid', '3857', 'Purge/Vidange', '25')
, ( 'dw' ,  103, 103, 'aep_equipement_public', 'asset', 'geom', 'uuid', '3857', 'Equipement public', '25')
, ( 'dw' ,  103, 103, 'aep_defense_incendie', 'asset', 'geom', 'uuid', '3857', 'Défense incendie', '24')
, ( 'dw' ,  103, 103, 'aep_point_desserte', 'asset', 'geom', 'uuid', '3857', 'Point désserte', '21')
, ( 'dw' ,  104, 104, 'aep_branche', 'asset', 'geom', 'uuid', '3857', 'Branchement', '25')
, ( 'dw' ,  100, 105, 'aep_canalisation', 'asset', 'geom', 'uuid', '3857', 'Canalisation', '20')
, ( 'dw' ,  100, 105, 'aep_canalisation_abandonnee', 'asset', 'geom', 'uuid', '3857', 'Canalisation abandonnée', '20')
----
, ( 'ww' ,  202, 202, 'ass_ouvrage', 'asset', 'geom', 'uuid', '3857', 'Ouvrage', '32')
, ( 'ww' ,  203, 203, 'ass_equipement', 'asset', 'geom', 'uuid', '3857', 'Equipement', '35')
, ( 'ww' ,  203, 203, 'ass_boite_de_branchement', 'asset', 'geom', 'uuid', '3857', 'Boite de branchement', '31')
, ( 'ww' ,  203, 203, 'ass_avaloir', 'asset', 'geom', 'uuid', '3857', 'Avaloir / Grille', '33')
, ( 'ww' ,  200, 203, 'ass_regard', 'asset', 'geom', 'uuid', '3857', 'Regard', '34')
, ( 'ww' ,  204, 204, 'ass_branche', 'asset', 'geom', 'uuid', '3857', 'Branchement', '31')
, ( 'ww' ,  200, 205, 'ass_collecteur', 'asset', 'geom', 'uuid', '3857', 'Collecteur', '30')
, ( 'ww' ,  200, 205, 'ass_canalisation_abandonnee', 'asset', 'geom', 'uuid', '3857', 'Collecteur Abandonné', '30')
, ( 'ww' ,  200, 205, 'ass_surface_hydraulique', 'asset', 'geom', 'uuid', '3857', 'Cours d''eau / fossé', '35')
, ( 'ww' ,  200, 205, 'ass_drain', 'asset', 'geom', 'uuid', '3857', 'Drain', '35')
, ( 'ww' ,  200, 205, 'ass_canalisation_fictive', 'asset', 'geom', 'uuid', '3857', 'Canalisation fictive', null)
---
;

update layer set num_order = id ;


insert into workorder_task_status( wts_code, wts_slabel, wts_llabel)
  values
('CREE','créé','créé'),
('ENVOYEPLANIF','envoyé à la planification','envoyé à la planification'),
('PLANIFIE','planifié','planifié'),
('TERMINE','terminé','terminé'),
('ANNULE','annulé','annulé');



-- creating grid
with metro_grid as (
select ST_CreateFishnet(100, 100, 10000, 10000, 99040, 6125317) as res
),
temp_metro_grid as
(
select (st_setsrid((g.res).geom, 2154)) as geom
from metro_grid g
),
reunion_grid as (
select ST_CreateFishnet(1, 1, 66000, 66000, 314600, 7634100) as res
),
temp_reunion_grid as
(
select (st_setsrid((g.res).geom, 2975)) as geom
from reunion_grid g
)
insert into app_grid(geom)
select st_transform(geom, 3857) as geom from temp_metro_grid
union all
select st_transform(geom, 3857) as geom from temp_reunion_grid
;

-- Insert contracts

insert into contract_activity(act_code, act_slabel, act_llabel )
  values
  ('ASST','Assainissement','Assainissement')
  , ('AEP','Eau','Eau')
  , ('MIXTE','Mixte','Mixte')
  , ('TRAVAUX','Travaux','Travaux');

insert into contract
(ctr_code,
  ctr_slabel,
  ctr_llabel,
  ctr_start_date,
  ctr_end_date,
  act_code,
  geom)
select
code
, lib_court
, lib_long
, date_debut
, date_fin
, case
	when activite = 'Eau Potable / Assainissement' then 'MIXTE'
	when activite = 'Adduction / Distribution Eau Potable' then 'AEP'
	when activite = 'Collecte / Traitement Assainissement' then 'ASST'
end
, st_transform(geom, 3857)
from asset.config_contrat cc
on conflict do nothing;

-- Insert city

insert into city(cty_code, cty_label, geom)
select
cde_insee
, libelle
, st_transform(geom, 3857)
from asset.config_commune
on conflict do nothing;


-- Insert workorders parameters
--  FIXME doublon de code / clef sur ID qui peut changer / plus facile de metre un code unique en lien avec les workorders
insert into workorder_task_reason(wtr_slabel, wtr_llabel, wtr_code)
values
('Poser', 'Poser', '10'),
('Raccorder', 'Raccorder', '11'),
('Renouveler', 'Renouveler', '12'),
('Réaliser un Métré', 'Réaliser un Métré', '13'),
('Mettre hors service', 'Mettre hors service', '14'),
('Entretenir / Réparer / Maintenir', 'Entretenir / Réparer / Maintenir', '15'),
('Contrôler / Enquêter / Relever', 'Contrôler / Enquêter / Relever', '16'),
('Entretenir / Réparer BAC ou Fontes de Voirie', 'Entretenir / Réparer BAC ou Fontes de Voirie', '17'),
('Repérer / Enquêter sur X,Y', 'Repérer / Enquêter sur X,Y', '19'),
('Rechercher Fuite', 'Rechercher Fuite', '20'),
('Réparer Fuite', 'Réparer Fuite', '21'),
('Purger', 'Purger', '22'),
('Nettoyer', 'Nettoyer', '23'),
('Informe Arrêt d''Eau', 'Informe Arrêt d''Eau', '28'),
('Exécuter un arrêt ou une remise en eau', 'Exécuter un arrêt ou une remise en eau', '29'),
('Curer', 'Curer', '30'),
('Désobstruer', 'Désobstruer', '31'),
('Pomper Vidanger', 'Pomper Vidanger', '32'),
('Détruire nuisible', 'Détruire nuisible', '33'),
('Réaliser une ITV', 'Réaliser une ITV', '34'),
('Réhabiliter', 'Réhabiliter', '35'),
('Test à la fumée', 'Test à la fumée', '36'),
('Terrasser', 'Terrasser', '40'),
('Effectuer un remblais', 'Effectuer un remblais', '41'),
('Effectuer Réfection de Voirie X,Y', 'Effectuer Réfection de Voirie X,Y', '42');

alter sequence workorder_task_reason_id_seq restart with 170;

-- FIXME assoction via l'ID pénible , mieux vaut utiliser un code
insert into asset_type_wtr(asset_type, wtr_code)
values
('20', '10'),
('20', '11'),
('20', '12'),
('20', '14'),
('20', '16'),
('20', '20'),
('20', '21'),
('20', '22'),
----------------
('21', '10'),
('21', '12'),
('21', '14'),
('21', '16'),
('21', '21'),
----------------
('23', '23'),
----------------
('23', '10'),
('23', '11'),
('23', '12'),
('23', '14'),
('23', '15'),
('23', '16'),
('23', '17'),
('23', '21'),
----------------
('24', '10'),
('24', '11'),
('24', '12'),
('24', '14'),
('24', '15'),
('24', '16'),
('24', '21'),
----------------
('25', '10'),
('25', '12'),
('25', '15'),
('25', '16'),
('25', '17'),
('25', '21'),
----------------
('26', '10'),
('26', '11'),
('26', '12'),
('26', '14'),
('26', '15'),
('26', '16'),
('26', '17'),
('26', '21'),
----------------
('27', '10'),
('27', '11'),
('27', '12'),
('27', '14'),
('27', '15'),
('27', '17'),
('27', '21'),
----------------
('29', '13'),
('29', '19'),
('29', '20'),
('29', '21'),
('29', '28'),
('29', '29'),
('29', '40'),
('29', '41'),
('29', '42'),
----------------
('30', '10'),
('30', '12'),
('30', '15'),
('30', '16'),
('30', '30'),
('30', '31'),
('30', '32'),
('30', '34'),
('30', '35'),
('30', '36'),
----------------
('31', '10'),
('31', '12'),
('31', '15'),
('31', '16'),
('31', '30'),
('31', '31'),
('31', '32'),
('31', '34'),
----------------
('32', '16'),
('32', '30'),
('32', '31'),
('32', '32'),
----------------
('33', '10'),
('33', '12'),
('33', '15'),
('33', '16'),
('33', '17'),
('33', '30'),
('33', '31'),
('33', '32'),
----------------
('34', '12'),
('34', '15'),
('34', '16'),
('34', '17'),
('34', '30'),
('34', '31'),
('34', '32'),
('34', '33'),
----------------
('35', '10'),
('35', '12'),
('35', '15'),
('35', '16'),
('35', '17'),
----------------
('39', '13'),
('39', '16'),
('39', '32'),
('39', '40'),
('39', '41'),
('39', '42')
;
