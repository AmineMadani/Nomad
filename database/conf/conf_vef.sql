set search_path to nomad, public;

-- Snapping tolerance of the underlying model, in map units
insert into float_setting values ('topo.snap_tolerance', 0.05 );

-- Set SRID
insert into text_setting values ('srid', 3857::integer);

-- insert raster Layer
insert into basemaps (map_slabel, map_type, map_url, map_layer, map_matrixset, map_format, map_projection, map_tilegrid, map_style, map_attributions, map_default, map_display)
values
('OpenStreetMap',
 'OSM',
 null, -- 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
 'OSM',
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

insert into domains
  ( dom_type    , dom_parent_id,   dom_llabel             , dom_slabel)
  values
  ( 'asset' , NULL       , 'Patrimoine'        , 'PAT'   ),
  ( 'wo'    , NULL       , 'Intervention'      , 'INT'   ),
  ( 'geo'   , NULL       , 'Périmètre'         , 'GEO'   )
;
insert into domains
  ( dom_type    , dom_parent_id,   dom_llabel             , dom_slabel)
  values
( 'dw'  , (select id from domains where dom_type = 'asset')    , 'Eau Potable'       , 'AEP'   ),
( 'ww'  , (select id from domains where dom_type = 'asset')    , 'Assainissement'    , 'ASS'   );

-- insert into tree
insert into tree
  ( id, dom_id    , tre_parent_id , tre_slabel)
  values
  (   1   , (select id from domains where dom_type = 'geo')    , NULL  , 'Admin/Orga'),
  ---
  ( 100   , (select id from domains where dom_type = 'dw')    , NULL    , 'Réseau Eau Potable'),
    ( 101 , (select id from domains where dom_type = 'dw')    , 100     , 'Unités Fonctionnelles'),
    ( 102 , (select id from domains where dom_type = 'dw')    , 100     , 'Ouvrages'),
    ( 103 , (select id from domains where dom_type = 'dw')    , 100     , 'Equipements'),
    ( 106 , (select id from domains where dom_type = 'ww')    , 100     , 'Vannes'),
    ( 104 , (select id from domains where dom_type = 'dw')    , 100     , 'Branchements'),
    ( 105 , (select id from domains where dom_type = 'dw')    , 100     , 'Canalisations'),
  ---
  ( 200   , (select id from domains where dom_type = 'ww')    , NULL    , 'Réseau Assainissement'),
    ( 201 , (select id from domains where dom_type = 'ww')    , 200     , 'Unités Fonctionnelles'),
    ( 202 , (select id from domains where dom_type = 'ww')    , 200     , 'Ouvrages'),
    ( 203 , (select id from domains where dom_type = 'ww')    , 200     , 'Equipements'),
    ( 204 , (select id from domains where dom_type = 'ww')    , 200     , 'Branchements'),
    ( 205 , (select id from domains where dom_type = 'ww')    , 200     , 'Collecteurs')
  ---
;



insert into asset_type(dom_id, ast_code, ast_slabel ) values
  ((select id from domains where dom_type = 'dw'),'20', 'Canalisation AEP')
, ((select id from domains where dom_type = 'dw'),'21', 'Branchemment AEP')
, ((select id from domains where dom_type = 'dw'),'22', 'Ouvrages AEP')
, ((select id from domains where dom_type = 'dw'),'23', 'Vannes AEP')
, ((select id from domains where dom_type = 'dw'),'24', 'Equipement Incendie')
, ((select id from domains where dom_type = 'dw'),'25', 'Equipement de Comptage')
, ((select id from domains where dom_type = 'dw'),'26', 'Autre Equipement AEP')
, ((select id from domains where dom_type = 'dw'),'27', 'Equipement de Régulation')
, ((select id from domains where dom_type = 'dw'),'28', 'Multi-patrimoine AEP') -- FIXME
, ((select id from domains where dom_type = 'dw'),'29', 'X, Y, Adresse AEP')
--------------------------------------------
, ((select id from domains where dom_type = 'ww'),'30', 'Collecteur')
, ((select id from domains where dom_type = 'ww'),'31', 'Branchement ASST')
, ((select id from domains where dom_type = 'ww'),'32', 'Ouvrages ASST')
, ((select id from domains where dom_type = 'ww'),'33', 'Avaloir')
, ((select id from domains where dom_type = 'ww'),'34', 'Regard')
, ((select id from domains where dom_type = 'ww'),'35', 'Autre équipement ASST')
, ((select id from domains where dom_type = 'dw'),'38', 'Multi-patrimoine ASST') -- FIXME
, ((select id from domains where dom_type = 'ww'),'39', 'X, Y, Adresse ASST')
;

insert into layer
(
    dom_id
  , tre_group_id
  , tre_simplified_group_id
  , lyr_table_name
  , lyr_geom_column_name
  , lyr_uuid_column_name
  , lyr_geom_srid
  , lyr_slabel
  , ast_id
)
values

  ((select id from domains where dom_type = 'dw') ,  102, 102, 'asset.aep_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage', (select id from asset_type where ast_code = '22'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_equipement', 'geom', 'uuid', '3857', 'Equipement', (select id from asset_type where ast_code = '26'))
, ((select id from domains where dom_type = 'dw') ,  106, 104, 'asset.aep_vanne_de_branche', 'geom', 'uuid', '3857', 'Vanne de branchement', (select id from asset_type where ast_code = '26'))
, ((select id from domains where dom_type = 'dw') ,  106, 103, 'asset.aep_vanne', 'geom', 'uuid', '3857', 'Vanne', (select id from asset_type where ast_code = '23'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_compteur', 'geom', 'uuid', '3857', 'Compteur', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_regulation', 'geom', 'uuid', '3857', 'Regulateur', (select id from asset_type where ast_code = '27'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_purge', 'geom', 'uuid', '3857', 'Purge/Vidange', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_equipement_public', 'geom', 'uuid', '3857', 'Equipement public', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_defense_incendie', 'geom', 'uuid', '3857', 'Défense incendie', (select id from asset_type where ast_code = '24'))
, ((select id from domains where dom_type = 'dw') ,  103, 103, 'asset.aep_point_desserte', 'geom', 'uuid', '3857', 'Point désserte', (select id from asset_type where ast_code = '21'))
, ((select id from domains where dom_type = 'dw') ,  104, 104, 'asset.aep_branche', 'geom', 'uuid', '3857', 'Branchement', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') ,  100, 105, 'asset.aep_canalisation', 'geom', 'uuid', '3857', 'Canalisation', (select id from asset_type where ast_code = '20'))
, ((select id from domains where dom_type = 'dw') ,  100, 105, 'asset.aep_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Canalisation abandonnée', (select id from asset_type where ast_code = '20'))
----
, ((select id from domains where dom_type = 'ww'),  202, 202, 'asset.ass_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage', (select id from asset_type where ast_code = '32'))
, ((select id from domains where dom_type = 'ww'),  203, 203, 'asset.ass_equipement', 'geom', 'uuid', '3857', 'Equipement', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww'),  203, 203, 'asset.ass_boite_de_branchement', 'geom', 'uuid', '3857', 'Boite de branchement', (select id from asset_type where ast_code = '31'))
, ((select id from domains where dom_type = 'ww'),  203, 203, 'asset.ass_avaloir', 'geom', 'uuid', '3857', 'Avaloir / Grille', (select id from asset_type where ast_code = '33'))
, ((select id from domains where dom_type = 'ww'),  200, 203, 'asset.ass_regard', 'geom', 'uuid', '3857', 'Regard', (select id from asset_type where ast_code = '34'))
, ((select id from domains where dom_type = 'ww'),  204, 204, 'asset.ass_branche', 'geom', 'uuid', '3857', 'Branchement', (select id from asset_type where ast_code = '31'))
, ((select id from domains where dom_type = 'ww'),  200, 205, 'asset.ass_collecteur', 'geom', 'uuid', '3857', 'Collecteur', (select id from asset_type where ast_code = '30'))
, ((select id from domains where dom_type = 'ww'),  200, 205, 'asset.ass_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Collecteur Abandonné', (select id from asset_type where ast_code = '30'))
, ((select id from domains where dom_type = 'ww'),  200, 205, 'asset.ass_surface_hydraulique', 'geom', 'uuid', '3857', 'Cours d''eau / fossé', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww'),  200, 205, 'asset.ass_drain', 'geom', 'uuid', '3857', 'Drain', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww'),  200, 205, 'asset.ass_canalisation_fictive', 'geom', 'uuid', '3857', 'Canalisation fictive', null)
, ((select id from domains where dom_type = 'asset'),  null, null, 'asset.xy', 'geom', 'uuid', '3857', 'XY', null)
---
;

update layer set lyr_num_order = id ;


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

insert into contract_activity(cta_code, cta_slabel, cta_llabel )
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
  cta_id,
  geom)
select
code
, lib_court
, lib_long
, date_debut
, date_fin
, a.id
, st_transform(geom, 3857)
from asset.config_contrat cc
join contract_activity a
on
case
	when activite = 'Eau Potable / Assainissement' then 'MIXTE'
	when activite = 'Adduction / Distribution Eau Potable' then 'AEP'
	when activite = 'Collecte / Traitement Assainissement' then 'ASST'
end
=
a.cta_code
on conflict do nothing;

-- Insert city

insert into city(cty_code, cty_slabel, cty_llabel, geom)
select
cde_insee
, libelle
, lib_maj
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

drop table if exists tmp_asset_type_wtr;
create table tmp_asset_type_wtr(ast_code text, wtr_code text, ast_id integer, wtr_id integer);
insert into tmp_asset_type_wtr(ast_code, wtr_code)
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

update tmp_asset_type_wtr t
   set ast_id = a.id
  from asset_type a
  where a.ast_code =  t.ast_code;

update tmp_asset_type_wtr t
   set wtr_id = w.id
  from workorder_task_reason w
  where w.wtr_code =  t.wtr_code;

insert into ast_wtr(ast_id, wtr_id ) select ast_id, wtr_id from tmp_asset_type_wtr;

drop table if exists tmp_asset_type_wtr;
