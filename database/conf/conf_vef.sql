\encoding UTF8

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
  , lyr_table_name
  , lyr_geom_column_name
  , lyr_uuid_column_name
  , lyr_geom_srid
  , lyr_slabel
  , ast_id
)
values

  ((select id from domains where dom_type = 'dw') , 'asset.aep_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage', (select id from asset_type where ast_code = '22'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_equipement', 'geom', 'uuid', '3857', 'Equipement', (select id from asset_type where ast_code = '26'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_vanne_de_branche', 'geom', 'uuid', '3857', 'Vanne de branchement', (select id from asset_type where ast_code = '26'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_vanne', 'geom', 'uuid', '3857', 'Vanne', (select id from asset_type where ast_code = '23'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_compteur', 'geom', 'uuid', '3857', 'Compteur', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_regulation', 'geom', 'uuid', '3857', 'Regulateur', (select id from asset_type where ast_code = '27'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_purge', 'geom', 'uuid', '3857', 'Purge/Vidange', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_equipement_public', 'geom', 'uuid', '3857', 'Equipement public', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_defense_incendie', 'geom', 'uuid', '3857', 'Défense incendie', (select id from asset_type where ast_code = '24'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_point_desserte', 'geom', 'uuid', '3857', 'Point désserte', (select id from asset_type where ast_code = '21'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_branche', 'geom', 'uuid', '3857', 'Branchement', (select id from asset_type where ast_code = '25'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_canalisation', 'geom', 'uuid', '3857', 'Canalisation', (select id from asset_type where ast_code = '20'))
, ((select id from domains where dom_type = 'dw') , 'asset.aep_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Canalisation abandonnée', (select id from asset_type where ast_code = '20'))
----
, ((select id from domains where dom_type = 'ww') , 'asset.ass_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage', (select id from asset_type where ast_code = '32'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_equipement', 'geom', 'uuid', '3857', 'Equipement', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_boite_de_branchement', 'geom', 'uuid', '3857', 'Boite de branchement', (select id from asset_type where ast_code = '31'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_avaloir', 'geom', 'uuid', '3857', 'Avaloir / Grille', (select id from asset_type where ast_code = '33'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_regard', 'geom', 'uuid', '3857', 'Regard', (select id from asset_type where ast_code = '34'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_branche', 'geom', 'uuid', '3857', 'Branchement', (select id from asset_type where ast_code = '31'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_collecteur', 'geom', 'uuid', '3857', 'Collecteur', (select id from asset_type where ast_code = '30'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Collecteur Abandonné', (select id from asset_type where ast_code = '30'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_surface_hydraulique', 'geom', 'uuid', '3857', 'Cours d''eau / fossé', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_drain', 'geom', 'uuid', '3857', 'Drain', (select id from asset_type where ast_code = '35'))
, ((select id from domains where dom_type = 'ww') , 'asset.ass_canalisation_fictive', 'geom', 'uuid', '3857', 'Canalisation fictive', null)
, ((select id from domains where dom_type = 'asset'), 'asset.xy', 'geom', 'uuid', '3857', 'XY', null)
, ((select id from domains where dom_type = 'asset'), 'asset.workorder', 'geom', 'uuid', '3857', 'Workorder', null)
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

INSERT INTO nomad.form_definition (fdn_definition,fdn_code) VALUES
	 ('{"key":"work-order-creation-form","editable":true,"definitions":[{"key":"workordercreationlist","type":"section","component":"list","editable":true,"label":"","attributes":{}},{"key":"ctr_id","type":"property","component":"referential","editable":false,"label":"Contrat *","attributes":{"value":"","repository":"contract","repositoryKey":"id","repositoryValue":"ctr_slabel"},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"cty_id","type":"property","component":"referential","editable":false,"label":"Commune *","attributes":{"value":"","repository":"city","repositoryKey":"id","repositoryValue":"cty_slabel"},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"wtr_id","type":"property","component":"referential","editable":false,"label":"Action *","attributes":{"value":"","repository":"v_layer_wtr","repositoryKey":"wtr_id","repositoryValue":"wtr_llabel","filters":["lyr_table_name"]},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"wko_name","type":"property","component":"input","editable":true,"label":"Libelle","attributes":{"type":"text","hiddenNull":false},"section":"workordercreationlist"},{"key":"wko_agent_nb","type":"property","component":"select","editable":true,"label":"Nombre d''agents *","attributes":{"value":"","options":[{"key":"1","value":"1"},{"key":"2","value":"2"},{"key":"3","value":"3"},{"key":"4","value":"4"}],"default":1},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"wko_planning_start_date","type":"property","component":"datepicker","editable":false,"label":"Date de début *","attributes":{"value":"","dateformat":"yyyy-MM-dd","type":"text","hiddenNull":false},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"},{"key":"dateformat","value":"yyyy-MM-dd","message":"La date saisie est incorrect"}]},{"key":"wko_planning_end_date","type":"property","component":"datepicker","editable":false,"label":"Date de fin *","attributes":{"value":"","placeholder":"yyyy-MM-dd","dateformat":"yyyy-MM-dd","type":"text","hiddenNull":false},"section":"workordercreationlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"},{"key":"dateformat","value":"yyyy-MM-dd","message":"La date saisie est incorrect"}]},{"key":"wko_emergency","type":"property","component":"radio","editable":true,"label":"Urgent","attributes":{"value":"","default":"false","options":[{"key":"true","value":"Oui"},{"key":"false","value":"Non"}]},"section":"workordercreationlist"},{"key":"wko_appointment","type":"property","component":"radio","editable":true,"label":"Rendez-vous","attributes":{"value":"","default":"false","options":[{"key":"true","value":"Oui"},{"key":"false","value":"Non"}]},"section":"workordercreationlist"},{"key":"wko_creation_comment","type":"property","component":"input","editable":true,"label":"Commentaire","attributes":{"value":"","type":"text","hiddenNull":false},"section":"workordercreationlist"}],"relations":[{"key":"rel1","relatedFrom":"wko_planning_start_date","relatedTo":"wko_planning_end_date","relation":"dateBefore","message":"La date de début doit être inférieur ou égale à la date de fin","options":{"dateformat":"yyyy-MM-dd"}}]}','DEFAULT_WORKORDER_CREATION'),
	 ('{"key":"work-orders","editable":true,"definitions":[{"key":"workorderlist","type":"section","component":"list","editable":true,"label":"","attributes":{}},{"key":"wtr_id","type":"property","component":"referential","editable":false,"label":"Raison","attributes":{"value":"","repository":"v_layer_wtr","repositoryKey":"wtr_id","repositoryValue":"wtr_llabel","filters":["lyr_table_name"]},"section":"workorderlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"wko_planning_start_date","type":"property","component":"datepicker","editable":false,"label":"Date de début","attributes":{"value":"","dateformat":"yyyy-MM-dd","type":"text","hiddenNull":false},"section":"workorderlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"},{"key":"dateformat","value":"yyyy-MM-dd","message":"La date saisie est incorrect"}]},{"key":"wko_planning_end_date","type":"property","component":"datepicker","editable":false,"label":"Date de fin","attributes":{"value":"","placeholder":"yyyy-MM-dd","dateformat":"yyyy-MM-dd","type":"text","hiddenNull":false},"section":"workorderlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"},{"key":"dateformat","value":"yyyy-MM-dd","message":"La date saisie est incorrect"}]},{"key":"ctr_id","type":"property","component":"referential","editable":false,"label":"Contrat","attributes":{"value":"","repository":"contract","repositoryKey":"id","repositoryValue":"ctr_slabel"},"section":"workorderlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"wko_address","type":"property","component":"input","editable":true,"label":"Adresse","attributes":{"value":"","placeholder":"Adresse de l''intervention","default":"","type":"text","hiddenNull":false},"section":"workorderlist"},{"key":"wko_agent_nb","type":"property","component":"select","editable":true,"label":"Nombre d''agents","attributes":{"value":"","options":[{"key":"1","value":"1"},{"key":"2","value":"2"},{"key":"3","value":"3"},{"key":"4","value":"4"}]},"section":"workorderlist","rules":[{"key":"required","value":"Obligatoire","message":"Ce champs est obligatoire"}]},{"key":"attachment","type":"property","component":"attachment","editable":false,"label":"Pièces jointes","attributes":{"value":[{"filename":"demo1.jpg","size":"128ko"},{"filename":"demo2.jpg","size":"254ko"},{"filename":"demo3.jpg","size":"89ko"}]},"section":"workorderlist"}]}','DEFAULT_WORKORDER_VIEW'),
	 ('{"key":"equipment-details","editable":false,"definitions":[{"key":"details","type":"section","component":"grid","editable":false,"label":"","attributes":{}},{"key":"features-col-1","type":"section","component":"col","editable":false,"label":"","attributes":{},"section":"details"},{"key":"features-col-2","type":"section","component":"col","editable":false,"label":"","attributes":{},"section":"details"},{"key":"features-col-3","type":"section","component":"col","editable":false,"label":"","attributes":{},"section":"details"},{"key":"features","type":"section","component":"list","editable":false,"label":"Caractéristiques","attributes":{},"section":"features-col-1"},{"key":"environment","type":"section","component":"list","editable":false,"label":"Localisation & Environnement","attributes":{},"section":"features-col-2"},{"key":"segment-container","type":"section","component":"container","editable":false,"label":"","attributes":{},"section":"features-col-3"},{"key":"segments","type":"section","component":"tabs","editable":false,"label":"Caractéristiques","attributes":{},"section":"segment-container"},{"key":"tab1","type":"section","component":"tab","editable":false,"label":"Historique des interventions","attributes":{},"section":"segments"},{"key":"tab2","type":"section","component":"tab","editable":false,"label":"Cycle de vie","attributes":{},"section":"segments"},{"key":"synthetic","type":"property","component":"layer-reference","editable":false,"label":"Synthétique","attributes":{"value":"SYNTHETIC"},"section":"features"},{"key":"detailed","type":"property","component":"layer-reference","editable":false,"label":"Details","attributes":{"value":"DETAILED"},"section":"environment"},{"key":"wko-history","type":"property","component":"history","editable":false,"label":"Interventions","attributes":{"value":"","default":""},"section":"tab1"},{"key":"work-order-cycle","type":"property","component":"life-cycle","editable":false,"label":"","attributes":{"value":""},"section":"tab2"},{"key":"attachments","type":"property","component":"bottom-attachment","editable":false,"label":"Pièces jointes","attributes":{"value":[{"filename":"demo1.jpg","size":"128ko"},{"filename":"demo2.jpg","size":"254ko"},{"filename":"demo3.jpg","size":"89ko"}]}}]}','DEFAULT_EQUIPMENT_DETAILS_VIEW'),
	 ('{"key":"equipment-details","editable":false,"definitions":[{"key":"segments","type":"section","component":"tabs","editable":false,"label":"Segments","attributes":{}},{"key":"tab1","type":"section","component":"tab","editable":false,"label":"Caractéristiques","attributes":{},"section":"segments"},{"key":"tab2","type":"section","component":"tab","editable":false,"label":"Historique des interventions","attributes":{},"section":"segments"},{"key":"tab3","type":"section","component":"tab","editable":false,"label":"Cycle de vie","attributes":{},"section":"segments"},{"key":"synthetic","type":"property","component":"layer-reference","editable":false,"label":"Synthétique","attributes":{"value":"SYNTHETIC"},"section":"tab1"},{"key":"wko-history","type":"property","component":"history","editable":false,"label":"Interventions","attributes":{"value":"","default":""},"section":"tab2"},{"key":"work-order-cycle","type":"property","component":"life-cycle","editable":false,"label":"","attributes":{"value":""},"section":"tab3"},{"key":"attachment","type":"property","component":"bottom-attachment","editable":false,"label":"Pièces jointes","attributes":{"value":[{"filename":"demo1.jpg","size":"128ko"},{"filename":"demo2.jpg","size":"254ko"},{"filename":"demo3.jpg","size":"89ko"}]}}]}','DEFAULT_EQUIPMENT_DETAILS_VIEW_MOBILE');

INSERT INTO nomad.form_template (fte_code,fdn_id) VALUES
	 ('WORKORDER_CREATION',(select id from nomad.form_definition where fdn_code = 'DEFAULT_WORKORDER_CREATION')),
	 ('WORKORDER_VIEW',(select id from nomad.form_definition where fdn_code = 'DEFAULT_WORKORDER_VIEW')),
	 ('EQUIPMENT_DETAILS_VIEW',(select id from nomad.form_definition where fdn_code = 'DEFAULT_EQUIPMENT_DETAILS_VIEW')),
	 ('EQUIPMENT_DETAILS_VIEW_MOBILE',(select id from nomad.form_definition where fdn_code = 'DEFAULT_EQUIPMENT_DETAILS_VIEW_MOBILE'));


INSERT INTO nomad.form_definition (fdn_definition,fdn_code) VALUES
	 ('[{"name":"Reseau eau potable","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAELSURBVHgB7VRBDsIgEFzQg8bULxjf4cmTB9/kzX/4Dz/ggzRGW1pc2kEppa2NNTGmk0wDhZ1ZYIFowN9DNIzJwLjb196YdhgMyLE/ng6a9LII0U0J5NhtVluIZkzFTNHOMSY/Q6HX/FkUvVZ9gwiCCTMGFf4FDLojQtYx4jP0qS+DCQRNrHKMDHUfBrYYTOYj8opD0udwq0aE3L8K39FsmdnTGXPOnCIJW4Z+7Utn/M68MM/MKxXnUTkDK2QrIfWSCZ2RP7+USJ2Bcb9BcETth59iBTHazxsdMlCYTGi3GVixBHGKnBWEAiVELd1CqHuLNL22qLRNdZkJR1i8YWD7lQev68USAdEBP44HUyVYM931GtwAAAAASUVORK5CYII=","segment":true,"segmentName":"Eau Potable","child":[{"name":"Branchements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"aep_branche"},{"name":"Canalisations","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"aep_canalisation"},{"name":"Ouvrages","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"aep_ouvrage"},{"name":"Equipements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAELSURBVHgB7VRBDsIgEFzQg8bULxjf4cmTB9/kzX/4Dz/ggzRGW1pc2kEppa2NNTGmk0wDhZ1ZYIFowN9DNIzJwLjb196YdhgMyLE/ng6a9LII0U0J5NhtVluIZkzFTNHOMSY/Q6HX/FkUvVZ9gwiCCTMGFf4FDLojQtYx4jP0qS+DCQRNrHKMDHUfBrYYTOYj8opD0udwq0aE3L8K39FsmdnTGXPOnCIJW4Z+7Utn/M68MM/MKxXnUTkDK2QrIfWSCZ2RP7+USJ2Bcb9BcETth59iBTHazxsdMlCYTGi3GVixBHGKnBWEAiVELd1CqHuLNL22qLRNdZkJR1i8YWD7lQev68USAdEBP44HUyVYM931GtwAAAAASUVORK5CYII=","child":[{"name":"Vanne","imgSource":"data:image/png;base64,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","child":[{"name":"Fermée","imgSource":"data:image/png;base64,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","child":[{"name":"Electrovanne","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAJ+SURBVFhH7ZfNbtNAFEY9TprUgFTEI/AILBBISNCGHYLETSt1VVa8FSuQQPy4LQJBUYlbeAQeBalq08Q23zfxDSZ1Es/YrPCRJh6P7TtH985YjlNTU/M/cex7Ku2WJvRXK4v1F4MKAg822/9GToCkm3aNOdlqVSuHUmgZHDto4VH3ynWeQ7LBownf+239zKDn7SDW50N/RWLPlS6SCXn4Btq668YfKdnZP49MJE/67eb9YBh9660+USp5jaG7Laex9HmTUsX8ge09SH6B5FpRyePNduNBMBxDrusqJ0iHf6XHhZgISiaH6NyB5GGRTIaQW9/TmetBbg9DzcmV6XEhJoICA49TSWZyriTlNiCHa5R7jyHON9YXC2IjmKBRMlokmZXDfZTjNS4TozltBAVOmCPpNWbk3qX3GsuRMoIkR/IsmpFjtq3kSFlBkpX8euSvXUUWH+OcZS0lR6oQJLqEkLrdUKOfOL6SMbRSc1QlSODFDZTcRLuGfoRWOn5VgswUBaNEuTuJo56jr0uPxl1vTRWCUsYIJtud4PQNNsoz9F9gTMpsLVlWMCu3hdfMQdj3VngB/acZSQpaSZYRFLnxVI7vv+BshFeMjpuR5LlVJm0EudaycttTObz/eAPO4xxJKbcRNoKyOydrbkZOyJF8ia5snMLYCLbQ/qy5HDmBkviKEcndVFKvUYDT5ZgISnkuELm/TE54eHBJkuUmlQvqe1O5D0XkhBlJlvstul7sJEvXZBFBCfJDOeoWJviEL2S3qJxASfwX0fPFo+Yu9tqjU3WhY2/snxfK5lyyf2qQOZOsXwKS01iVQsnQn2SgLIOuh1iTktfU1NTULMJxfgNqxzWjKahxCwAAAABJRU5ErkJggg==","layerKey":"aep_vanne","styleKey":"AEP_VANNE_FERME_ELECTRO"},{"name":"Robinet Vanne","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAThSURBVFhH7Zi9bxxFGMZ3ZvbjLv6CEJCjIFIQJQWi4KOgQI6oiKkJkEBBQw02dhznLFCk+DOWIxoKJKC0/QcQIBQQIZqgpKMjIQkSDkIiIBLubndnXp53vZNsznfnvVu7QPIjjfZrduY3z7zv7Nw5/2tNu65IT7dVM57XfT+LQbCtkEu+3137p4QYmJTyEJ8vlcvbAvlRqZS0W5HyySkhHuXzKSkf6Eumx3uaS6e1JETvgFIfw/4jo9UqLQSBSipskc6WSurdWo0QRi/0uu6ngeft4fvlhrDaAGgpQqK6FGIvyjIgXzxRr+uzWwTJcOO1mp5W6hlXyhVAHKpK+S8/00mN+9oASOkRJBLnVZw+ZIRYAeTQOCCLOsnvp3DPCqVW0Md+4zh3JdEGFlbTmyw8IIxGHjTGecKYfSEg5wFZxMkFOMfvzwFOK7X6GNHBp9A+AJWd1wfmF2oJ6KOw3QMow8bEjxPtrQmxupA6uei6Ld9tJgxKnoBz84CLAIeMOPCK1vEjRE6M59wfKzcgiytHKL2oN6y13kc0WAXknOcdHotjs5QTcglwGJRh50KGIzowHMf6YThXx/NGqKw27cBC9qAxjDiBrPN0B8HQKCBxbDvd7Nwo4GZdd905hkM7eeBYuRywkLsykDWi1QXfH5pokzhJQgBuHnCxlKt7MnAhnufpPBcgiyE5VrKQSPHVed8/3Cxx+JrvM1wEOHaO38vrnFVuQFYWkp1A4gzWHGeZITlxzqWQ53idwzUW/efCBucYrpNOOwJkWUiOySNamyS7ATkHyBFALfq+O4JsnQEcnFth51Cvo2nNqmNAloXk7LaQcGZ51vdfGgvDeNbzntf34czuFC7vtGbVFSCLO7NLkIXE9edInHe0EJ9l4GS3cKyuAVkWEtMtkQA0SLQfH9RPdhM9zdcM10lCNFMhwKzuoDAsVOXjHSGS73oROFYhQAbwUH7HV/ELpcQfUl7qEeLl20J8cx77ul+F0EFar1t1Dcid8vfzluOYr5RSfwtxpUfrN7G8fN8XRW/fdZyLX0upbghhikB2BWjh1tbh5F8MZ8zR8Tj+ecb3vfeJfuuP4zcA+R0gZRHIjgGbwF3uIXoNm4drWGbUqTCMznieGiG61RvHxxGbhSA7AmwB9/pYFF1luMkwTDbEU1GkASlHidZ6AFnEydyA3CgnhIVDIlwupXCY1ntwVoA0DDkGSHbSQl4HJA8yL2QuQAuHhNDWuV5M60QKh2lt/CmRyEKyk4jJYwx5AZA3O8juTQGzcF8iW+HclX6OuSi61g7OiiGnEZPvISYZEjFps1vDSeyn26stoIXjdQ7OJUtJvzGvjgAuTYi2cFYVxKSFHFjP7otwUt1EuLCT7dQSEJ8o4eII55zzSnnsXB/gsIv+pVnMbaYsJC9BnN0YtIvpdtAPYZee1Gt0tCUgKvLvQH1DSudPIX4sEx1luOkOnGtUFrKk9fF/HOfbq2gfaMZO9qaA9ttJEM77UX4yiLmT6bRWuoSzspATxqwJZLci+oH7cYRI2Gz/VhsdTK32PC+IiC5pomMfRNH17DpXVCmkrMDJujFvoY8LAVGZn6H3RhOba1LKXRXXxY7JcbABbRzYlgi/9JJ2TwbBwIdK9SU3OxVGui1wVmeK/Ad5epvhrE53+x/hjna0I8f5D7Z+qMASnUgQAAAAAElFTkSuQmCC","layerKey":"aep_vanne","styleKey":"AEP_VANNE_FERME_ROBINET"},{"name":"1/4 de tour","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAANPSURBVFhH7Zc9aBRBFMff7N5dEEUwCLHRykqTu5gqTQotEkUtBEVERQQVkrskWggp0lkEbDTm7oKmMEUsFAsVtRDrgEVM7nJEURFFiFikEgST3Z383+wOnl6824+zcv+wzNvZm/d+vDdfR7FixfpfVMqTKOWF8F4jaWFCiFKBmuKrRotFMjwzlOYn/hHY/DhtmRsXbWyHhZy/9Qvu9bjY6Zl11TBQpUgmt8kU7U8lZaVcoK6OAXLKXr9fLSBz+4ZIsg0fY6mUfPF22vVRmfx7VhsCSuWSyHGoBc12zMJn5QnqTg+QjUC+IBmuc9CDy9M1+BhxJLWurbrxdYyN1BjQayHJjvDsECY9B2RPOks2yl0XsvQ73HVh0KgCkrSqwapi1CjIXNJl+AnH2wD5FCv7AMptlyc3hgSckfHgsGpvAO4qxtrqo/AXOwigVgKPjUBbDYOeICu96f7aTKKsDOewvVigvCHoMsao9yAKA8gZYRiG3IysPEImj3Am9YJiOJRVwWCe3kG2sh4cVyHQNhMGUEtDbkImHwLyWDtDTopkFdw0FsTFsHCsKIAshnQA0ALI+4A82d4v116OkAm4GcCdiwLHigrIYh8MmQTkTKVoXmjbJe4C7rQHx99DwbGaAcjSkAkhnClB8ixsXq2R/TcLUInTJEnM4lmGqeYo90dRswAdlNTA8n68vNLWg1SeAO0K+iJDNgPQhZP04Md3Ot47+tXJZGlWOnQYwN+iQkYB5P1Qw937XKZT3SNk4c5o8qadydErxwakpOUokGEA3amGx4Obxpl85uhtcrDNGJmctNXxV6AE9sM526ZD+M0XD9JiB0EUBrAabgpw57lTHW05d4Nmod/i2w6uWGXLooMY9Qlj1DHp/sKfQgEyHAIWAHGJOzhz+vSoFt92GLJrmJaQyT6M+YCxSe+zLwUBVAAcAJm72ZGlHL+7Za2F09KQnUP0bs2iPqT/DXxwHXyVuyEgbiG6TbANuDEEvcJ9uBOKenBaVZn8aK2qTL7HqdNqmrAgHSOUcFVSw9HuwTOoOiGG80zfYkhusdJ3Y6UPl4rBfWyopT/+IqKsoR0DMtC89x2IIbE6hI1jIp1zSxNWgBSmIcTefmznsWLFihWrjojWAaaWWZI4cb67AAAAAElFTkSuQmCC","layerKey":"aep_vanne","styleKey":"AEP_VANNE_FERME_TOUR"}]},{"name":"Ouvert","imgSource":"data:image/png;base64,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","child":[{"name":"Electrovanne","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAJSSURBVFhH7ZbJTttQFIZjOyBVIFHxCDwCC0QlNqhLVIpUImWVrthnfIpML8CKSiCmqhWIYcOij8CjsAOcuP/v+kTGdZI77fAnHV0P8blfzvG9SamgoOA90Wq1vOTQGpe53tBsNq0Tu8gxE0zgJ4fadDodt3Iig/Ez4qFer39MzgOOOkAufqbRaFTx/A3aLLmnSqtUQh5eRWz7vn9FycFgMNKRbLfb5W63O4Lcrud5J7j0KYqiuc/rtGqcjFuQvIXkiqok5IJerxdC7ivkLpPLT8k4Ex1BqeQzYhOSdyqVRBspx8rtQe4nLpX/3ZmMM9ERFJg4RFCSlZwqSbl+v897lLvAJc7HZ5UxEYwQlBwhpkqm5XBKOd7ja6I1p4mgwAlzJTNy58lnteWIjSDJlczIsdpGcsRWkKQl77EYliD3Bedsq5UccSFIpIUbkHzEeJy6ZjWHK0HCbQh7b7SGcRnBqlrndyXISlFwhO2kivEQIa3nqjfGhaC0kTIVLJBTLJQDHB8hpM3GkraCabl9iP3CFrPAGzj+jkEkKWgkaSMocvxlEDnuf69YxXHelCTPjSppIsh3LS1XScmxkhQb50hKu7UwEZTVGb9zWTkhR/IHQhaOMiaCiwhOkm5r7qSUxMYtkjUMlIzfUaDUbh1Bac8L4ts8OWE4HGYl2W7iXFA+S7nfKnJCRpLtPkN8QMx9J1UEJckfbMLrmOAacr6qnEBJeSfDMKwh104QBHFu5DTagiYgsfyb5v88nar/Byo5yeUUSkoFbKGk7RctKCgoeB+USn8BQQcf952EUgQAAAAASUVORK5CYII=","layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_ELECTRO"},{"name":"Robinet Vanne","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAIjSURBVFhH7ZY9a9VQHIeTexUtLYhbv4NLpQWhghR0cXHs4FA79DN0LBS6OHRwKVQHBxcHhw5ugh9DnERsFYSi9nXoi+nzuz0/PQS9N7d5GTQ/eHpycs/550ly0iRp06bNf5Q0SdM0bJdPlbVy6YT2opFYLXJjnPX1sH1Ryd9iaTquv+edcumG9iF8goleL0kuhbZoYplleAdjvV5JUQvOQwZbMKkdxL8NSnzFl0B1vsA17SCVCD4CFRZf4RYogyRjuRVwjY9QqaCv4FFot+E2KH+TjOUeg+adhlbLpRbBn3AStr/BDCh5yVhuFfJzaxP0FfCBfsA9UDw2lnsCljONCApL7sJ9SDppJ36618BzLFb7LY4FhSUP4AEoOuAz8HjLua+2MUFhyf1upzvHW+xp6OflvE9to4K/9iPnvqXzDCUYL+ZKwhfFeyS/s6kTk0ypVCUoEdV6kyXZzSzLZtk+hEokB6XoQ/IaRsG5CzsQjxFD3eIi6SfoA2/ACCga7ztzB3S747GNCOrJ9AFfwRVQ4iXjedOg16IlG/lHbbmXcBmUP61nz9WHhT4wNMfv8toEj0P7Avxbv4fNY6ZAn1iaW4vgHLj4c3DRfnKOa+hjV2Kq8QEqFVwAFV7v9c5TRM5xnRvwGfZgoKAn9YsmS+wqbMJi6EtOC75oNEfH01p8CxJUqzVd6goq+QJlCg5z1YeKpFS89NkS1alNtE2bNm3+nSTJGd5g1EEwQs90AAAAAElFTkSuQmCC","layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_ROBINET"},{"name":"1/4 de tour","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAKJSURBVFhH7ZfLbtQwFIbHMwMCgUrFI/QRWCCQ2CCWiIsElbqgTrvgrZAml1FnuAoE4rLpgkfgUVi1zCTh/z0+UdrOJbbDinySZedi+xufEyfT6+jo+J9I01TZZjBtjnWGNEmCB07i+N/ICZDs26YzWQs/8Awig/oByvE4y7bt8YC1C5AzfbCCewjx16PpdDH2mnA3WQnpfBPlflEUn8fj8baOotxFEnLDffSB3GOl1KRXlnfnJyeL/mVpqmW4hKqw9b0iz79B8kZTyTSOB5CbQ+4J5N7b0797anO0XQRltFOUO5D83mQlk9FooA8OuHJPIfcBp4aLK1W9FhdBgQPPUSjJlVwpSbno8DDP0pRy73CK87FvY3wEmTCUzFFWStblyrKkHK8xTZzm9BEUOOEFST6p5+Te2nud5UiIILkgySf1nBxX20uOhAqSuuSP6WRyDXKPbFiD5EgbgkRCeHs2m/2C3FHtXNAcbQkSbkNwK3dQX0fhqgaP35YgV4qCeV+pPTReoS2hX/2aaEAbghLGHHvd7gutX+NBeYnjFEXC7C0ZKliXe76v9UfshZd4AVtOhEokKeglGSIocnORw+tsALEZvk7MuDVJHnutpI8gc60ut2vkuDnjncsbtNbFEkkJtxM+gvJ0mpyr5LA5m6sWI2m/Ja1khiIPTmN8BC+jVDm3TE6AWF1SYwuipMlR0CjcLoISnj+QeyY5t0pOoGRiJZEClGS4SbnuQ1VwETT3WrlPRs7m3CYQ4QL3i2QEyTdoXlXD4cac3Cyo1GIQpX6i3ILcl3g06jeVE3B/JQlBjR/68MrWlhkbq+y1BVXU/9TIJL6gfzVWq1BSEj4USso21NHR0dGxjl7vLwSlZKxiaGWSAAAAAElFTkSuQmCC","layerKey":"aep_vanne","styleKey":"AEP_VANNE_OUVERT_TOUR"}]}]},{"name":"Equipement incendie","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARBSURBVHgB7Zt/UtNAFMe/Bfw1KI0zzjj+ZRhFx78oJ7CcQDwBvYHlBC0naD0B5QTICQonaPmLGcBp/UOccdSm4CDyo/G9JGisybakuxtw9jPspE1Dk3zz9u17b7eAwWAw6CODK0ALsC9eO/Q3523SJzVxdoDCGLBIF5Cjt1bfx44LbPSA9WdADSmhXZxdIE+irCBkLQNoU6s9AZahGa3iUPcpkTWUkYz2CTD/whdLC2PQxIjCMPZNoL7jd0MtaLEcCcKE0WZBysXZ9p94C3Jpkg+ag2KUd6sb8iwmTG5Xzff+hVLLYf8wDjSgBucAmFYZE01AIWQ1zhn5ByjCglqkWQ6ZhzUJLCBFKHB0ngPvIAlp4rz3na6N9KmSs16CBKQ45CA3snE1kGa92oLA64gRR4AUcaYpWiXntYErAEXiq5CE1DiHM+7QF9eoPYZ6mr3AAVNc4tCDakISUuOcmZD17EEPJEx3RpHVGp8jwIgjwIgjwIgjwIgjQGlWPiwTto2buRzGLQun7TbOgpY2qYpjlUqYKhQ8cfr5sbGBw9VVfK/VkBapiMNiPFxbw62cXyvvOQ6ONzdxTtsbbEWzs7iTz/vt5Ut8XVryjrlWUJmixKUKah1qK9uhzJyCwDbtc/vbB9t2T1stlzmh7X4+70Yd97lQ+H3ccaPhtiwr8rjdUADIETqdtx5cT4MnDpEGdPJKxMW2GkGBLk6cYW44SshOpSIUh4WJ+byIhCQarQILiTqpfVdwMfcC/8JO99P8/MCuwk55PzjOKhZxm7pZHFSrLkXtH4vZPwyJxJkQFLYygkm3qTdvvG1neXloH8ICdd++9V5PLsTXsXpecSASq5WwECc9znFj6t5sMeyAWZTLjkCHwfGTr15BJ9qCwIvh+mRrC5eFrYdF5e8Ys1TPOfzh2kTIvW7X2/6X4riBj8lks0jCxGO/bqYzctYmzmlwU+x3Lvv0L0apn01pRb6hkC5OJmZ6ln0GpwRMtni50INDAOZofR1JcBJOGScdypuZ+BPGzjjyEM5kaUiPyqeimCIh7y0uepZ3KB7lIs9L19mc0ynOtL9m759laLRv86lgDd8xWQ7HLNytHtXrAwViYR5UKt7rA/o/kb+hILCa6Vuzww+Q2mukAQdXlCZUqdX2+vKYuPSB21G97l5wsLLifgzlV5xS8PvwMd/K5dgUI5xbBddT4Ouhz8pJgz/liMThxjc8iPNOx/1SLArzr12F82XK1ufs+RN9wnkr7lb3y2VvBOMyBcOOmwNFdt7danVgmkFpw+ZMaL5MJqmKIwOV4pgasgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjoCRl6DEVdvOoQcqj2ajrkHG79NHqufwSguMsIpBNbx4m2o9VSRkpG7lplW8HhK6uVmMwEjdikx64fwKW854Cj/UNxgMBoNBL78AOokz+BOqO5IAAAAASUVORK5CYII=","layerKey":"aep_defense_incendie"},{"name":"Equipements comptage réseau","imgSource":"data:image/png;base64,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"},{"name":"Autres équipements réseau","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAYAAABxLuKEAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMPSURBVHgB7dyLbdswEAbgP0UH8AgeISMkG7QTVCN0g3qDZgNng4ygEdwNzE7gbMCQERkzjKiXeXc0rR84BIgdS/pMnV5EgDW3EQ1skSHfUEksiKkXrDnHgPwydTLVYM07yMbUX1Pa1BFrPnadg0OxdY+aM2UDzXse3K7jUfaoOW4UnEbe8zsA0Q5oi5oT7BoPPa/ZfrKPUGztUHPsESXY2Kfotbif6JtouG7Dj9HusXGvxf0krAY1JzjkhvXD1J8EyM003L4NPw2g6FtquHPqCTUnarhT61j1aOlpuFOrQc1JNNzR0YKao9MNd6y2qDkDDdceidqrOjxrd8KV4XOagaZ6r7tT/z6wLRYm17qnPvxFX3hpP9BwD+GG94yaHRbGLbMFVdzKni7BSTTc5/gbjUbVEQsTfBGLP2PKQtpgWM/G0f0Nd5d470afz3wbLEg0OllgFuHozw139P6sG0l7LEjPLssGMwsn3jX09Lt0W8xMoo+xwkzCiVb0oAnPRQaaOzvMKE7QcL802czrN3SJIQKTxNHnhrsDYfT4dZcYTC+O+5sGhNHTLkZFYT7huOZJ+qxHT79CF4cZ7TkZ12fObYvZMBQP9W2DbSlxdHdka0F4hKOa7UCGw4FiQzkNJDsOF4oN9fyYbDicKDYcE4cuxuFGseGaUbUYRwLFhnOq2WwcKRQb7jl4k3EkUWwkJieO4kij2EjN2kzilIBiIzmd9QtOKSg20vN8P3BKQrH5DvlYnL2p/yjoSWMJMMrUT1Ov6EZMEdNSpXclZerxzvy862AeTf1DAZGEUXAo/hcl4UjBKEQoPqXgSMAoJFB8SsDhhlEYQfGRxuGEUZiI4iOJwwWjMBPFRwqHA0ZhIYqPBA41jMKFKD7cOJQwCplQfDhxqGAUMqP4cOFQwCgQofhw4OSGUSBG8aHGyQmjwITiU8Tlw8hD/aMWvJeiu8mMh5wP9ecsvC0RJVi/IRx2mCJQfAZwWGGKQvFJ4LDBFIni04PDAlM0ik+EQw5zFSg+AQ4pzPM1ofg4nPX/yqxZI5M3fWfyW8aAw+cAAAAASUVORK5CYII="},{"name":"Autre équipements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGBSURBVHgB7drNTcNAEMXxJ6CAlBA6CTeOlEBJlDCUQAVLCZRACRy5LWsCyiRSRo6z3o/Z95feweuL9TtaCzDGGGOM+ez25HmT9pj2nfYFdtRLWvxbSHtO24L9Jjjg6BEK53EIhXk4w0IJLsMZCkqwHMc9lCAPjksoQX4cN1CCdXG6hhKUw+kOSlAHpwsoQX2cZqEEbeE0BSVoF6c6lKAPnCpQAiB2vIAVoQRAdLKAzFACIDpcQAYoARCdLyyFEgBxoIVLoASo/sE1oTYa4wbsv13akz4gjhFxjIhjRBwj4hgRx4g4RsQxIo4RcYyIY0QcI+IYEefQdAfyXR+MjjOBvKY9pN2nfeqXdxivCeQN+x97HzBuzY6CMxtE5xlnEYjOG87VIDoPOFlBdL3irAai6wmnCIiudZziILoWcaqC6FrBaQZEVxOnSRBdaZzmQXQlcLoC0a2F0y2ILieOCxDdtTjuQHRLcFyD6ObiDAOis3CGBLHaYo+xw8n9OMYYY+v2A5qKGT7WdM82AAAAAElFTkSuQmCC"}]}]},{"name":"Reseau assainissement","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAELSURBVHgB7VRBDsIgEFzQg8bULxjf4cmTB9/kzX/4Dz/ggzRGW1pc2kEppa2NNTGmk0wDhZ1ZYIFowN9DNIzJwLjb196YdhgMyLE/ng6a9LII0U0J5NhtVluIZkzFTNHOMSY/Q6HX/FkUvVZ9gwiCCTMGFf4FDLojQtYx4jP0qS+DCQRNrHKMDHUfBrYYTOYj8opD0udwq0aE3L8K39FsmdnTGXPOnCIJW4Z+7Utn/M68MM/MKxXnUTkDK2QrIfWSCZ2RP7+USJ2Bcb9BcETth59iBTHazxsdMlCYTGi3GVixBHGKnBWEAiVELd1CqHuLNL22qLRNdZkJR1i8YWD7lQev68USAdEBP44HUyVYM931GtwAAAAASUVORK5CYII=","segment":true,"segmentName":"Assainissement","customFilter":[{"type":"check","name":"Pluviale","key":"type_eau","value":"Eaux pluviales"},{"type":"check","name":"Eau usée","key":"type_eau","value":"Eau usée"},{"type":"check","name":"Unitaire","key":"type_eau","value":"Unitaire"}],"child":[{"name":"Branchements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"ass_branche"},{"name":"Collecteurs","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"ass_collecteur"},{"name":"Ouvrages","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIWSURBVHgBtZa/T9tAFMcfjmNRbNJIyVJEpatEulCpZqlcqRRHLP2x5D+o44S5XTtV/AnMIEP3Vk2i/piiJNDB6oAdqTAQhotsBApLpMQghQz4BQUFFAMi9mfx+e7e9+nuvbt3Y3A7sqKqYjjMPRcEgWBHt3PWbDmtyoamme5v+SbjMa8BSZKU+YWFj7Ozz0Se54fOaTQaYNsWLRWLy7qub9zVAckuLa2/mn8tewkP4/evn3Rd05Juk3o6SKVS5IUklRKJpwTuQa22R//pejKXy9F+HzMwPpI4graogVr9vlC/kc5kDEl6SWBEYrFYNBKJiMb29tdLBxjQD0paAZ94NDVFjg4P67Ztm70tSi4ufgEfweTADMQ2OpCnpx8T8BlMb9QOKWo2NTcnvgGf4TgOJgW+ykwKEzIEBJ5+hg1zDyEgJnjhCQMBwzitdh0ConPWaTLdbteEgDh12mVG09bMkxMH/Ob4uAGae51jDMo7/3d9X4VtHVDU7gX571Zlxe9VlEvFZfz27iLLssx4PC7PzCQI+MAftzYUCoU0ti/TdG11Nb1fq1EYEdTQLgoPXHHgQqumkRzFCdqiBgxUtaElU81kSm/fvSdwRzB+W5ubFXcXFLhWMkND5jcNw1g5sK36+PgDkWVDUa/ajMKmUTV/fP/2OZ/Pf0Lb63M8XxUDyKqaFXn3UmRZLoodTrtN8YDiGYJbni3nB3fJbET9pfwAAAAASUVORK5CYII=","layerKey":"ass_ouvrage"},{"name":"Equipements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAELSURBVHgB7VRBDsIgEFzQg8bULxjf4cmTB9/kzX/4Dz/ggzRGW1pc2kEppa2NNTGmk0wDhZ1ZYIFowN9DNIzJwLjb196YdhgMyLE/ng6a9LII0U0J5NhtVluIZkzFTNHOMSY/Q6HX/FkUvVZ9gwiCCTMGFf4FDLojQtYx4jP0qS+DCQRNrHKMDHUfBrYYTOYj8opD0udwq0aE3L8K39FsmdnTGXPOnCIJW4Z+7Utn/M68MM/MKxXnUTkDK2QrIfWSCZ2RP7+USJ2Bcb9BcETth59iBTHazxsdMlCYTGi3GVixBHGKnBWEAiVELd1CqHuLNL22qLRNdZkJR1i8YWD7lQev68USAdEBP44HUyVYM931GtwAAAAASUVORK5CYII=","child":[{"name":"Avaloir","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAIXSURBVHgB7dn/MfxAGAbw5/sd/6MCqwI6EBWgAtEBFaACVCAqQAWoABXYDlwH7DPvmxnD2fw4ci7zfGbeiZtcLrtPNps9B4iIiIiIiIiIiIiIiMhA/mX2nafawfjdpjqctmMpc9BKqokfPFa8+Mvf7cyFQ0+pTjBeIbfzP+RbCidD4WQonAyFk6FwMpoe5b8hpCp8u+bb8Ok9kw/1DFtSRN8OZohwuJjcTbXlW3qAdZZbLjIn/roWfLvpf3MFu+Hvu/fjbvz1XFSpLtFfkeo61SusQ+xgwGwYVumf9wZrX4H+KvTsY9XzwCLVHSyUE9jI+Q0BFtRLqkf/u6sKA4VTwEJhY0sMq/Tz8vyhw3EVMn38iacVR8YZ7Bbi/LHuJx1S5ee9ggV0jB8wazicAzikA6xx55ivKtU2rC0cSQEzmCWcfdhouUi1hzk+OT6JsNuM7eKF20VPfR/lx94AhjLo2qMDjuJ72AXkMuAUHfUJpw6Gwzfib+OFYzvv/HWngLqGs0jB1CJ6BtRlzuEirsRiBVOLsHaXsLmylbYjJ8BGzSIGU4uwOZJzUP19LavNyOE6hkPyFH938m2L7edTjAE1rtxzP81UsO8vE/+gA4wHw4mpVmF9nNq3ptsqeG1jXBgGF4n1t/ypmm6rAnY7RYwLQzlCwwq6zYQcMN7frrKr+lw4EfZPpQLj9ewlIiIiIiIiIiIiIl+9A42zalATsuAWAAAAAElFTkSuQmCC","layerKey":"ass_avaloir"},{"name":"Regard","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAM8SURBVHgB7dpPThRBFAbwr6qZmMjCcaOSuBhuwA0cTuAALtzJDaA1ccu4NtjMCRh3JiLMDRhOwHgCZjfKRlyohKbrWUVjgiYoXX+6e+L7bSAhhOabV6+7qx7AGGOMMcYYY4wFJFCxTnLURNpoySha0JfTBKh55cdjpTDGzOloEM+foGSVhGMCkbi9JkBtfQntG/7aSFF2QOeqP3j5cIQSlBpO5/WkHc2IjQKBXGdESvV2X8z1EVAp4TxNJq0UYttDKL8hs+yQLg3iMJUkEdjy5qf1FNGh72AM/cm2IjQOl5PjBAEEqxzTVyLM6oumVZQgryK1OIjnxvAkSDh5MLf39bcLKJHvgIIsqyqCMcwyk5D7Hd3j4IH3cC7Xf+nB/JL3Ibl38fzkyGs4pvnqZ5d1VG9BYnYDjrz1nPx2be5K5PyJ+SJ0/9mJ54aw5K1yUkK3TsEYCnIbDryEY6oGQj5DzZj+s7w5WYUlL+HkVVNTUlr3Hueek/caeYQas+09zpVzptBGzWUkOrDgHI4Qdn+4TFIIq37o3nOEfIT6a9o8NTuF00m+NOt2+76OtFj+bpVzflrZa0JxxT9Ep3AiIaeiagwSsoWCnMIhoaYmHH3juIOCgu8ETrP/Jhwi+oqCnMK5OFOaEoKo8LmXW+XMTE84SsrCJxRO4eR7taL0k0gbDaRjFOTec0gdoObMxvt7i7Mt53CIMETtiSEsOIej5K1+3ZeWRPYWFpzDGcR3T+q8tMySst1H9vKcIwRtobbUK1jydvqwknze019qtbdjqmY3vj8PS96ekBtQcf16j33VGN7CeaefeYTjxfhFvd3YbX7H67vVTvxgS7+q91Axs5wy/OjCUZApi5Xk2Jx8VrIR5nPSIshbeYbGos69lLm9q3yPoAQde1t5c7ylX4fXUI5RBrXkc3gp6H7Oh+f3zNRFjOCol+G716kuo7yBSZJd/de8nqfrDawDKajrMknxN6WO2j5JJm0isa4fqR/DgQlFL9e+6636XyoZ0jaVdAZ9Ukro6I3vGx0K6rf/jwQaRoIGoSrlT5WP9xsXFQXZ1P98C+ryfEmap206iRCNUnwbVzHezxhjjDHGGGOMBfUTAZwhbV2ffpoAAAAASUVORK5CYII=","layerKey":"ass_regard"},{"name":"Autre équipements","imgSource":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGBSURBVHgB7drNTcNAEMXxJ6CAlBA6CTeOlEBJlDCUQAVLCZRACRy5LWsCyiRSRo6z3o/Z95feweuL9TtaCzDGGGOM+ez25HmT9pj2nfYFdtRLWvxbSHtO24L9Jjjg6BEK53EIhXk4w0IJLsMZCkqwHMc9lCAPjksoQX4cN1CCdXG6hhKUw+kOSlAHpwsoQX2cZqEEbeE0BSVoF6c6lKAPnCpQAiB2vIAVoQRAdLKAzFACIDpcQAYoARCdLyyFEgBxoIVLoASo/sE1oTYa4wbsv13akz4gjhFxjIhjRBwj4hgRx4g4RsQxIo4RcYyIY0QcI+IYEefQdAfyXR+MjjOBvKY9pN2nfeqXdxivCeQN+x97HzBuzY6CMxtE5xlnEYjOG87VIDoPOFlBdL3irAai6wmnCIiudZziILoWcaqC6FrBaQZEVxOnSRBdaZzmQXQlcLoC0a2F0y2ILieOCxDdtTjuQHRLcFyD6ObiDAOis3CGBLHaYo+xw8n9OMYYY+v2A5qKGT7WdM82AAAAAElFTkSuQmCC"}]}]}]','DEFAULT_ASSET_FILTER');

INSERT INTO nomad.form_template (fte_code,fdn_id) VALUES
	 ('ASSET_FILTER',(select id from nomad.form_definition where fdn_code = 'DEFAULT_ASSET_FILTER'));

INSERT INTO nomad.style_definition (syd_code,syd_definition) VALUES
	 ('AEP_DEFENSE_INCENDIE_DEFAULT','[{"id":"layer.aep_defense_incendie","type":"symbol","source":"aep_defense_incendie","minzoom":10,"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_DEFENSE_INCENDIE_DEFAULT","icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1},"paint":{"icon-translate":[0,-20],"icon-opacity":["case",["boolean",["feature-state","selected"],false],0,["boolean",["feature-state","hover"],false],0,1]}},{"id":"layer.aep_defense_incendie_hover","type":"symbol","source":"aep_defense_incendie","minzoom":10,"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_DEFENSE_INCENDIE_DEFAULT_HOVER","icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1},"paint":{"icon-translate":[0,-20],"icon-opacity":["case",["boolean",["feature-state","selected"],false],0,["boolean",["feature-state","hover"],false],1,0]}},{"id":"layer.aep_defense_incendie_selected","type":"symbol","source":"aep_defense_incendie","minzoom":10,"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_DEFENSE_INCENDIE_DEFAULT_SELECTED","icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1},"paint":{"icon-translate":[0,-20],"icon-opacity":["case",["boolean",["feature-state","selected"],false],1,0]}}]'),
	 ('AEP_VANNE_FERME_TOUR_DEFAULT','[{"id":"aep_vanne_fermee_tour","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Fermé"],["==",["get","type"],"1/4 de tour"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_FERMEE_TOUR","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1}}]'),
	 ('AEP_VANNE_FERME_ELECTRO_DEFAULT','[{"id":"aep_vanne_fermee_electro","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Fermé"],["==",["get","type"],"Electrovanne"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_FERMEE_ELECTRO","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1}}]'),
	 ('AEP_VANNE_OUVERT_ROBINET_DEFAULT','[{"id":"aep_vanne_ouvert_robinet","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Ouvert"],["==",["get","type"],"Robinet/Opercule"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_OUVERT_ROBINET","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":2}}]'),
	 ('AEP_VANNE_OUVERT_TOUR_DEFAULT','[{"id":"aep_vanne_ouvert_tour","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Ouvert"],["==",["get","type"],"1/4 de tour"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_OUVERT_TOUR","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1}}]'),
	 ('AEP_VANNE_OUVERT_ELECTRO_DEFAULT','[{"id":"aep_vanne_ouvert_electro","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Ouvert"],["==",["get","type"],"Electrovanne"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_OUVERT_ELECTRO","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1}}]'),
	 ('AEP_VANNE_FERME_ROBINET_DEFAULT','[{"id":"aep_vanne_fermee_robinet_decoration","type":"circle","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Fermé"],["==",["get","type"],"Robinet/Opercule"]],"layout":{},"paint":{"circle-opacity":0,"circle-color":"rgba(0, 0, 0, 0)","circle-radius":10,"circle-stroke-color":["case",["boolean",["feature-state","hover"],false],"rgb(0, 0, 0)",["boolean",["feature-state","selected"],false],"rgb(95, 204, 247)","rgb(95, 204, 247)"],"circle-stroke-opacity":["case",["boolean",["feature-state","hover"],false],1,["boolean",["feature-state","selected"],false],1,0],"circle-stroke-width":3}},{"id":"aep_vanne_fermee_robinet","type":"symbol","source":"aep_vanne","minzoom":14,"filter":["all",["==",["get","position"],"Fermé"],["==",["get","type"],"Robinet/Opercule"]],"layout":{"visibility":"none","icon-allow-overlap":true,"icon-image":"AEP_VANNE_FERMEE_ROBINET","icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"symbol-spacing":10,"icon-size":0.5,"symbol-sort-key":1}}]'),
	 ('AEP_BRANCHEMENT_DEFAULT','[{"id":"layer-aep_branche","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_branche_style_2","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_branche_style_3","type":"symbol","source":"aep_branche","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'),
	 ('AEP_OUVRAGE_DEFAULT','[{"id":"layer-aep_ouvrage","type":"symbol","source":"aep_ouvrage","minzoom":10,"layout":{"icon-image":["match",["get","type"],["Réservoir (sur tour)"],"AEP_RESERVOIR_TOUR",["Réservoir (semi enterré)"],"RESERVOIR_SEMI",["Station pompage","Station de reprise"],"STATION",["Usine de traitement"],"AEP_USINE_TRAITEMENT",""]},"paint":{}}]'),
	 ('ASS_BRANCHEMENT_DEFAULT','[{"id":"layer.ass_branche","type":"line","source":"ass_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#A1A1EA"},"line-dasharray":["literal",[3,2]]},{"id":"ass_branche_3","type":"symbol","source":"ass_branche","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]');
INSERT INTO nomad.style_definition (syd_code,syd_definition) VALUES
	 ('ASS_COLLECTEUR_DEFAULT','[{"id":"layer.ass_collecteur","type":"line","source":"ass_collecteur","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#6f5563"},"line-dasharray":["literal",[3,2]]},{"id":"ass_collecteur_style_3","type":"symbol","source":"ass_collecteur","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'),
	 ('ASS_OUVRAGE_DEFAULT','[{"id":"layer.ass_ouvrage","type":"circle","source":"ass_ouvrage","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(345, 34%, 42%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'),
	 ('ASS_AVALOIR_DEFAULT','[{"id":"layer.ass_ouvrage","type":"circle","source":"ass_ouvrage","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(345, 34%, 42%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'),
	 ('ASS_REGARD_DEFAULT','[{"id":"layer.ass_regard","type":"circle","source":"ass_regard","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(330, 20%, 20%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'),
	 ('AEP_CANALISATION_DEFAULT','[{"id":"layer-aep_canalisation","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_canalisation_style_2","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_canalisation_style_3","type":"symbol","source":"aep_canalisation","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'),
	 ('WORKORDER_DEFAULT','[{"id":"layer-workorder","type":"symbol","source":"workorder","minzoom":10,"layout":{"icon-allow-overlap":true,"icon-image":["case",["==",["get","wko_appointment"],true],"pin-rdv",["==",["get","wko_emergency"],false],"pin-urgent","pin-default"],"icon-offset":[0,0]},"paint":{"icon-translate":[0,-20],"icon-opacity":["case",["boolean",["feature-state","hover"],false],0,1]}},{"id":"layer-workorder-2","type":"symbol","source":"workorder","minzoom":10,"layout":{"icon-allow-overlap":true,"icon-image":["case",["==",["get","wko_appointment"],true],"pin-rdv-selected",["==",["get","wko_emergency"],false],"pin-urgent-selected","pin-default-workorder"],"icon-offset":[0,0]},"paint":{"icon-translate":[0,-20],"icon-opacity":["case",["boolean",["feature-state","hover"],false],1,0]}}]');


INSERT INTO nomad.style_image (syd_id, syi_code, syi_source) VALUES
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_ELECTRO_DEFAULT'),'AEP_VANNE_FERMEE_ELECTRO','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAJ+SURBVFhH7ZfNbtNAFEY9TprUgFTEI/AILBBISNCGHYLETSt1VVa8FSuQQPy4LQJBUYlbeAQeBalq08Q23zfxDSZ1Es/YrPCRJh6P7TtH985YjlNTU/M/cex7Ku2WJvRXK4v1F4MKAg822/9GToCkm3aNOdlqVSuHUmgZHDto4VH3ynWeQ7LBownf+239zKDn7SDW50N/RWLPlS6SCXn4Btq668YfKdnZP49MJE/67eb9YBh9660+USp5jaG7Laex9HmTUsX8ge09SH6B5FpRyePNduNBMBxDrusqJ0iHf6XHhZgISiaH6NyB5GGRTIaQW9/TmetBbg9DzcmV6XEhJoICA49TSWZyriTlNiCHa5R7jyHON9YXC2IjmKBRMlokmZXDfZTjNS4TozltBAVOmCPpNWbk3qX3GsuRMoIkR/IsmpFjtq3kSFlBkpX8euSvXUUWH+OcZS0lR6oQJLqEkLrdUKOfOL6SMbRSc1QlSODFDZTcRLuGfoRWOn5VgswUBaNEuTuJo56jr0uPxl1vTRWCUsYIJtud4PQNNsoz9F9gTMpsLVlWMCu3hdfMQdj3VngB/acZSQpaSZYRFLnxVI7vv+BshFeMjpuR5LlVJm0EudaycttTObz/eAPO4xxJKbcRNoKyOydrbkZOyJF8ia5snMLYCLbQ/qy5HDmBkviKEcndVFKvUYDT5ZgISnkuELm/TE54eHBJkuUmlQvqe1O5D0XkhBlJlvstul7sJEvXZBFBCfJDOeoWJviEL2S3qJxASfwX0fPFo+Yu9tqjU3WhY2/snxfK5lyyf2qQOZOsXwKS01iVQsnQn2SgLIOuh1iTktfU1NTULMJxfgNqxzWjKahxCwAAAABJRU5ErkJggg=='),
	 ((select id from nomad.style_definition where syd_code='AEP_DEFENSE_INCENDIE_DEFAULT'),'AEP_DEFENSE_INCENDIE_DEFAULT','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAARBSURBVHgB7Zt/UtNAFMe/Bfw1KI0zzjj+ZRhFx78oJ7CcQDwBvYHlBC0naD0B5QTICQonaPmLGcBp/UOccdSm4CDyo/G9JGisybakuxtw9jPspE1Dk3zz9u17b7eAwWAw6CODK0ALsC9eO/Q3523SJzVxdoDCGLBIF5Cjt1bfx44LbPSA9WdADSmhXZxdIE+irCBkLQNoU6s9AZahGa3iUPcpkTWUkYz2CTD/whdLC2PQxIjCMPZNoL7jd0MtaLEcCcKE0WZBysXZ9p94C3Jpkg+ag2KUd6sb8iwmTG5Xzff+hVLLYf8wDjSgBucAmFYZE01AIWQ1zhn5ByjCglqkWQ6ZhzUJLCBFKHB0ngPvIAlp4rz3na6N9KmSs16CBKQ45CA3snE1kGa92oLA64gRR4AUcaYpWiXntYErAEXiq5CE1DiHM+7QF9eoPYZ6mr3AAVNc4tCDakISUuOcmZD17EEPJEx3RpHVGp8jwIgjwIgjwIgjwIgjQGlWPiwTto2buRzGLQun7TbOgpY2qYpjlUqYKhQ8cfr5sbGBw9VVfK/VkBapiMNiPFxbw62cXyvvOQ6ONzdxTtsbbEWzs7iTz/vt5Ut8XVryjrlWUJmixKUKah1qK9uhzJyCwDbtc/vbB9t2T1stlzmh7X4+70Yd97lQ+H3ccaPhtiwr8rjdUADIETqdtx5cT4MnDpEGdPJKxMW2GkGBLk6cYW44SshOpSIUh4WJ+byIhCQarQILiTqpfVdwMfcC/8JO99P8/MCuwk55PzjOKhZxm7pZHFSrLkXtH4vZPwyJxJkQFLYygkm3qTdvvG1neXloH8ICdd++9V5PLsTXsXpecSASq5WwECc9znFj6t5sMeyAWZTLjkCHwfGTr15BJ9qCwIvh+mRrC5eFrYdF5e8Ys1TPOfzh2kTIvW7X2/6X4riBj8lks0jCxGO/bqYzctYmzmlwU+x3Lvv0L0apn01pRb6hkC5OJmZ6ln0GpwRMtni50INDAOZofR1JcBJOGScdypuZ+BPGzjjyEM5kaUiPyqeimCIh7y0uepZ3KB7lIs9L19mc0ynOtL9m759laLRv86lgDd8xWQ7HLNytHtXrAwViYR5UKt7rA/o/kb+hILCa6Vuzww+Q2mukAQdXlCZUqdX2+vKYuPSB21G97l5wsLLifgzlV5xS8PvwMd/K5dgUI5xbBddT4Ouhz8pJgz/liMThxjc8iPNOx/1SLArzr12F82XK1ufs+RN9wnkr7lb3y2VvBOMyBcOOmwNFdt7danVgmkFpw+ZMaL5MJqmKIwOV4pgasgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjgAjjoCRl6DEVdvOoQcqj2ajrkHG79NHqufwSguMsIpBNbx4m2o9VSRkpG7lplW8HhK6uVmMwEjdikx64fwKW854Cj/UNxgMBoNBL78AOokz+BOqO5IAAAAASUVORK5CYII='),
	 ((select id from nomad.style_definition where syd_code='AEP_DEFENSE_INCENDIE_DEFAULT'),'AEP_DEFENSE_INCENDIE_DEFAULT_SELECTED','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAABGCAYAAACe7Im6AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAVTSURBVHhe7ZpfaFtVGMC/+y+trcO4gkPotnZWabeBnT5UhsW+7MEHQURourZrVxD20L345Is6JkMffBA6RBgkLV1dK6Ki4CaC4J/N+uDMWHVbt7WxFLXitnaT2uT+83w3X+raJifJzb03mZzfQ+93TkOS+8v5851zLggEAkGASHQtK1r/2DUKwZLkFTPWtZuKZaVscqr6Rpd0Wd3EZGT9DoplWqpt/p0c6X2AqgIncDlMyh8pRdtiF/jREtigmUYyNdJTTVWBIdM1EEJ9J1eSSqhgMQi+lsmskgbG7UsADVQdCIHJQTF4k1QsGpS0c2B8dhqglap8J5BuVaqYu8Fu9ks00tgCkKAq3/BdDpuJrrKBt4mKniDZNtixiO/f3fduxbpDI4WeYUuS0xqp6Bu+ymE3MGfIikJFT8Fu+hNAmIq+4GvTnGWzS3Pf6CQVPWVqpDeiAsRZs1ykKs/xTI588NRl1ba2UrE82LbB8iHPkkZv5AxMxNnfx9OF8qLYlsWWH550ZU/GHNUyfe37xWBKskw/VskEmiHfawg5HLybrQYmbIrKCuvihjG8X6NiSXg6lbO85i8KMQ+po9B3QqZ+A68sOdT14e6HnUoP8CfPCXr2inb6ch9izOEg5HAQcjgIORyEHA4VI6fWNmAzpECzLaopP2WdypvUFPQ8vQN27dwGLz5ZT7UAH/44D5+cOQ+nZ27DTQhRLQefpvLS3zSzyIt2/rfxXYCcwdYHYejwPid+7/QUfHH2MiytGLCtrhaeam2EQ8+mz/XaXx6H75byNPBKlKP2v68bsqJiLNm2rdjWHEvdG/LJOdJRD6/37gU9kYDw0bOwLG3M9rdAEuZfbQe1oQEOD30Jx+O36D9ZIDl4JqbL6kN4UIj7zCFLv13KoaBrOcrBU6azPbAO2bau4JEuC7PKyYhJxuNw39A08BZkMrvB5GttjqDWwTG48E+OJROTg2LwTIxqVqky9eXkSE8tFYvC1YDMWkwimxiE3dAjFG4AB9xMi8knBrEkCaqO/gDW4iLEj3dzB2tsMRSuIaloNRQWjSs5rHXcT+EGMt0sG/tb0z/s1je+zSsmAwra/cpnTryrxnSu2WCLzpy94O4HFYrBlRy3PLO3xRl8F6C4870rqfSM9Xyb56c8XAKTg10Cp+vJ+CzVFA62HpSKU36QBNpySuHGzTsUBUdgcnQp/VHhTe6eJGlpCf7UJ9CWg5nvO4P7is4famwdXniiHr4+d4lqgiFQObgkQJq1pHMtlLbN6WOoMz8vONdiobyraFzJMWVlda94PZplLFO4gQ+up/819dZzToJXCNvZfX31dgSOjJ6Da3rudZZqmTqFa8BM2e0zhu7kxLqamYSsP78+3J0zG8VxZw/LdOVwGFZY5ptPEIpJnDjgxCe+mXGuuZge7n4Mn91Zz0ws4nr+d92tmIRq9mv9isevuK5yWkwBC8A4WwL0HPsUNLYkMKOd0BE2nTElA74Blg80Va+KefTQSfjN4q/OmYHETDTSWGWm7rDvZYZMPTkb7WzEenpJ0bheW3EpYFXepKXgzZc6VrcqPjo/71xx4M3w7ucX4djHF/KKqchVeU4K3M9B2sMW7Gmog3aWPSN/LtyC7+MJmJxb4o4xa/i/yvEEn+QEOpXfawg5HIQcDkIOByGHg5DDQcjhIORwEHI4CDkchBwOQg4HIYeDkMOh5KU+nptTuAZDVrZT6Du4I0nhKpYkrVixrmYquqIkObmetKgUcJ8bt3OpWDTub2xgIl7JYhBDUgrcSsxOSS1H6x/7nX2BDc/EVAozsciOUjbYBQKBQCCodAD+BT3aw3lZfzhcAAAAAElFTkSuQmCC'),
	 ((select id from nomad.style_definition where syd_code='AEP_DEFENSE_INCENDIE_DEFAULT'),'AEP_DEFENSE_INCENDIE_DEFAULT_HOVER','data:image/png;base64,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'),
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_ROBINET_DEFAULT'),'AEP_VANNE_OUVERT_ROBINET','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAIjSURBVFhH7ZY9a9VQHIeTexUtLYhbv4NLpQWhghR0cXHs4FA79DN0LBS6OHRwKVQHBxcHhw5ugh9DnERsFYSi9nXoi+nzuz0/PQS9N7d5GTQ/eHpycs/550ly0iRp06bNf5Q0SdM0bJdPlbVy6YT2opFYLXJjnPX1sH1Ryd9iaTquv+edcumG9iF8goleL0kuhbZoYplleAdjvV5JUQvOQwZbMKkdxL8NSnzFl0B1vsA17SCVCD4CFRZf4RYogyRjuRVwjY9QqaCv4FFot+E2KH+TjOUeg+adhlbLpRbBn3AStr/BDCh5yVhuFfJzaxP0FfCBfsA9UDw2lnsCljONCApL7sJ9SDppJ36618BzLFb7LY4FhSUP4AEoOuAz8HjLua+2MUFhyf1upzvHW+xp6OflvE9to4K/9iPnvqXzDCUYL+ZKwhfFeyS/s6kTk0ypVCUoEdV6kyXZzSzLZtk+hEokB6XoQ/IaRsG5CzsQjxFD3eIi6SfoA2/ACCga7ztzB3S747GNCOrJ9AFfwRVQ4iXjedOg16IlG/lHbbmXcBmUP61nz9WHhT4wNMfv8toEj0P7Avxbv4fNY6ZAn1iaW4vgHLj4c3DRfnKOa+hjV2Kq8QEqFVwAFV7v9c5TRM5xnRvwGfZgoKAn9YsmS+wqbMJi6EtOC75oNEfH01p8CxJUqzVd6goq+QJlCg5z1YeKpFS89NkS1alNtE2bNm3+nSTJGd5g1EEwQs90AAAAAElFTkSuQmCC'),
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_TOUR_DEFAULT'),'AEP_VANNE_FERMEE_TOUR','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAnCAYAAAB9qAq4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAANPSURBVFhH7Zc9aBRBFMff7N5dEEUwCLHRykqTu5gqTQotEkUtBEVERQQVkrskWggp0lkEbDTm7oKmMEUsFAsVtRDrgEVM7nJEURFFiFikEgST3Z383+wOnl6824+zcv+wzNvZm/d+vDdfR7FixfpfVMqTKOWF8F4jaWFCiFKBmuKrRotFMjwzlOYn/hHY/DhtmRsXbWyHhZy/9Qvu9bjY6Zl11TBQpUgmt8kU7U8lZaVcoK6OAXLKXr9fLSBz+4ZIsg0fY6mUfPF22vVRmfx7VhsCSuWSyHGoBc12zMJn5QnqTg+QjUC+IBmuc9CDy9M1+BhxJLWurbrxdYyN1BjQayHJjvDsECY9B2RPOks2yl0XsvQ73HVh0KgCkrSqwapi1CjIXNJl+AnH2wD5FCv7AMptlyc3hgSckfHgsGpvAO4qxtrqo/AXOwigVgKPjUBbDYOeICu96f7aTKKsDOewvVigvCHoMsao9yAKA8gZYRiG3IysPEImj3Am9YJiOJRVwWCe3kG2sh4cVyHQNhMGUEtDbkImHwLyWDtDTopkFdw0FsTFsHCsKIAshnQA0ALI+4A82d4v116OkAm4GcCdiwLHigrIYh8MmQTkTKVoXmjbJe4C7rQHx99DwbGaAcjSkAkhnClB8ixsXq2R/TcLUInTJEnM4lmGqeYo90dRswAdlNTA8n68vNLWg1SeAO0K+iJDNgPQhZP04Md3Ot47+tXJZGlWOnQYwN+iQkYB5P1Qw937XKZT3SNk4c5o8qadydErxwakpOUokGEA3amGx4Obxpl85uhtcrDNGJmctNXxV6AE9sM526ZD+M0XD9JiB0EUBrAabgpw57lTHW05d4Nmod/i2w6uWGXLooMY9Qlj1DHp/sKfQgEyHAIWAHGJOzhz+vSoFt92GLJrmJaQyT6M+YCxSe+zLwUBVAAcAJm72ZGlHL+7Za2F09KQnUP0bs2iPqT/DXxwHXyVuyEgbiG6TbANuDEEvcJ9uBOKenBaVZn8aK2qTL7HqdNqmrAgHSOUcFVSw9HuwTOoOiGG80zfYkhusdJ3Y6UPl4rBfWyopT/+IqKsoR0DMtC89x2IIbE6hI1jIp1zSxNWgBSmIcTefmznsWLFihWrjojWAaaWWZI4cb67AAAAAElFTkSuQmCC'),
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_TOUR_DEFAULT'),'AEP_VANNE_OUVERT_TOUR','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAKJSURBVFhH7ZfLbtQwFIbHMwMCgUrFI/QRWCCQ2CCWiIsElbqgTrvgrZAml1FnuAoE4rLpgkfgUVi1zCTh/z0+UdrOJbbDinySZedi+xufEyfT6+jo+J9I01TZZjBtjnWGNEmCB07i+N/ICZDs26YzWQs/8Awig/oByvE4y7bt8YC1C5AzfbCCewjx16PpdDH2mnA3WQnpfBPlflEUn8fj8baOotxFEnLDffSB3GOl1KRXlnfnJyeL/mVpqmW4hKqw9b0iz79B8kZTyTSOB5CbQ+4J5N7b0797anO0XQRltFOUO5D83mQlk9FooA8OuHJPIfcBp4aLK1W9FhdBgQPPUSjJlVwpSbno8DDP0pRy73CK87FvY3wEmTCUzFFWStblyrKkHK8xTZzm9BEUOOEFST6p5+Te2nud5UiIILkgySf1nBxX20uOhAqSuuSP6WRyDXKPbFiD5EgbgkRCeHs2m/2C3FHtXNAcbQkSbkNwK3dQX0fhqgaP35YgV4qCeV+pPTReoS2hX/2aaEAbghLGHHvd7gutX+NBeYnjFEXC7C0ZKliXe76v9UfshZd4AVtOhEokKeglGSIocnORw+tsALEZvk7MuDVJHnutpI8gc60ut2vkuDnjncsbtNbFEkkJtxM+gvJ0mpyr5LA5m6sWI2m/Ja1khiIPTmN8BC+jVDm3TE6AWF1SYwuipMlR0CjcLoISnj+QeyY5t0pOoGRiJZEClGS4SbnuQ1VwETT3WrlPRs7m3CYQ4QL3i2QEyTdoXlXD4cac3Cyo1GIQpX6i3ILcl3g06jeVE3B/JQlBjR/68MrWlhkbq+y1BVXU/9TIJL6gfzVWq1BSEj4USso21NHR0dGxjl7vLwSlZKxiaGWSAAAAAElFTkSuQmCC'),
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_ELECTRO_DEFAULT'),'AEP_VANNE_OUVERT_ELECTRO','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAJSSURBVFhH7ZbJTttQFIZjOyBVIFHxCDwCC0QlNqhLVIpUImWVrthnfIpML8CKSiCmqhWIYcOij8CjsAOcuP/v+kTGdZI77fAnHV0P8blfzvG9SamgoOA90Wq1vOTQGpe53tBsNq0Tu8gxE0zgJ4fadDodt3Iig/Ez4qFer39MzgOOOkAufqbRaFTx/A3aLLmnSqtUQh5eRWz7vn9FycFgMNKRbLfb5W63O4Lcrud5J7j0KYqiuc/rtGqcjFuQvIXkiqok5IJerxdC7ivkLpPLT8k4Ex1BqeQzYhOSdyqVRBspx8rtQe4nLpX/3ZmMM9ERFJg4RFCSlZwqSbl+v897lLvAJc7HZ5UxEYwQlBwhpkqm5XBKOd7ja6I1p4mgwAlzJTNy58lnteWIjSDJlczIsdpGcsRWkKQl77EYliD3Bedsq5UccSFIpIUbkHzEeJy6ZjWHK0HCbQh7b7SGcRnBqlrndyXISlFwhO2kivEQIa3nqjfGhaC0kTIVLJBTLJQDHB8hpM3GkraCabl9iP3CFrPAGzj+jkEkKWgkaSMocvxlEDnuf69YxXHelCTPjSppIsh3LS1XScmxkhQb50hKu7UwEZTVGb9zWTkhR/IHQhaOMiaCiwhOkm5r7qSUxMYtkjUMlIzfUaDUbh1Bac8L4ts8OWE4HGYl2W7iXFA+S7nfKnJCRpLtPkN8QMx9J1UEJckfbMLrmOAacr6qnEBJeSfDMKwh104QBHFu5DTagiYgsfyb5v88nar/Byo5yeUUSkoFbKGk7RctKCgoeB+USn8BQQcf952EUgQAAAAASUVORK5CYII='),
	 ((select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_ROBINET_DEFAULT'),'AEP_VANNE_FERMEE_ROBINET','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAAAThSURBVFhH7Zi9bxxFGMZ3ZvbjLv6CEJCjIFIQJQWi4KOgQI6oiKkJkEBBQw02dhznLFCk+DOWIxoKJKC0/QcQIBQQIZqgpKMjIQkSDkIiIBLubndnXp53vZNsznfnvVu7QPIjjfZrduY3z7zv7Nw5/2tNu65IT7dVM57XfT+LQbCtkEu+3137p4QYmJTyEJ8vlcvbAvlRqZS0W5HyySkhHuXzKSkf6Eumx3uaS6e1JETvgFIfw/4jo9UqLQSBSipskc6WSurdWo0QRi/0uu6ngeft4fvlhrDaAGgpQqK6FGIvyjIgXzxRr+uzWwTJcOO1mp5W6hlXyhVAHKpK+S8/00mN+9oASOkRJBLnVZw+ZIRYAeTQOCCLOsnvp3DPCqVW0Md+4zh3JdEGFlbTmyw8IIxGHjTGecKYfSEg5wFZxMkFOMfvzwFOK7X6GNHBp9A+AJWd1wfmF2oJ6KOw3QMow8bEjxPtrQmxupA6uei6Ld9tJgxKnoBz84CLAIeMOPCK1vEjRE6M59wfKzcgiytHKL2oN6y13kc0WAXknOcdHotjs5QTcglwGJRh50KGIzowHMf6YThXx/NGqKw27cBC9qAxjDiBrPN0B8HQKCBxbDvd7Nwo4GZdd905hkM7eeBYuRywkLsykDWi1QXfH5pokzhJQgBuHnCxlKt7MnAhnufpPBcgiyE5VrKQSPHVed8/3Cxx+JrvM1wEOHaO38vrnFVuQFYWkp1A4gzWHGeZITlxzqWQ53idwzUW/efCBucYrpNOOwJkWUiOySNamyS7ATkHyBFALfq+O4JsnQEcnFth51Cvo2nNqmNAloXk7LaQcGZ51vdfGgvDeNbzntf34czuFC7vtGbVFSCLO7NLkIXE9edInHe0EJ9l4GS3cKyuAVkWEtMtkQA0SLQfH9RPdhM9zdcM10lCNFMhwKzuoDAsVOXjHSGS73oROFYhQAbwUH7HV/ELpcQfUl7qEeLl20J8cx77ul+F0EFar1t1Dcid8vfzluOYr5RSfwtxpUfrN7G8fN8XRW/fdZyLX0upbghhikB2BWjh1tbh5F8MZ8zR8Tj+ecb3vfeJfuuP4zcA+R0gZRHIjgGbwF3uIXoNm4drWGbUqTCMznieGiG61RvHxxGbhSA7AmwB9/pYFF1luMkwTDbEU1GkASlHidZ6AFnEydyA3CgnhIVDIlwupXCY1ntwVoA0DDkGSHbSQl4HJA8yL2QuQAuHhNDWuV5M60QKh2lt/CmRyEKyk4jJYwx5AZA3O8juTQGzcF8iW+HclX6OuSi61g7OiiGnEZPvISYZEjFps1vDSeyn26stoIXjdQ7OJUtJvzGvjgAuTYi2cFYVxKSFHFjP7otwUt1EuLCT7dQSEJ8o4eII55zzSnnsXB/gsIv+pVnMbaYsJC9BnN0YtIvpdtAPYZee1Gt0tCUgKvLvQH1DSudPIX4sEx1luOkOnGtUFrKk9fF/HOfbq2gfaMZO9qaA9ttJEM77UX4yiLmT6bRWuoSzspATxqwJZLci+oH7cYRI2Gz/VhsdTK32PC+IiC5pomMfRNH17DpXVCmkrMDJujFvoY8LAVGZn6H3RhOba1LKXRXXxY7JcbABbRzYlgi/9JJ2TwbBwIdK9SU3OxVGui1wVmeK/Ad5epvhrE53+x/hjna0I8f5D7Z+qMASnUgQAAAAAElFTkSuQmCC');


INSERT INTO nomad.layer_style (lse_code,syd_id,lyr_id) VALUES
	 ('AEP_DEFENSE_INCENDIE',(select id from nomad.style_definition where syd_code='AEP_DEFENSE_INCENDIE_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_defense_incendie')),
	 ('AEP_VANNE_FERME_ROBINET',(select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_ROBINET_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_VANNE_FERME_TOUR',(select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_TOUR_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_VANNE_FERME_ELECTRO',(select id from nomad.style_definition where syd_code='AEP_VANNE_FERME_ELECTRO_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_VANNE_OUVERT_ROBINET',(select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_ROBINET_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_VANNE_OUVERT_TOUR',(select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_TOUR_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_VANNE_OUVERT_ELECTRO',(select id from nomad.style_definition where syd_code='AEP_VANNE_OUVERT_ELECTRO_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_vanne')),
	 ('AEP_CANALISATION',(select id from nomad.style_definition where syd_code='AEP_CANALISATION_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_canalisation')),
	 ('AEP_OUVRAGE',(select id from nomad.style_definition where syd_code='AEP_OUVRAGE_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_ouvrage')),
	 ('ASS_COLLECTEUR',(select id from nomad.style_definition where syd_code='ASS_COLLECTEUR_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.ass_collecteur'));
INSERT INTO nomad.layer_style (lse_code,syd_id,lyr_id) VALUES
	 ('ASS_OUVRAGE',(select id from nomad.style_definition where syd_code='ASS_OUVRAGE_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.ass_ouvrage')),
	 ('ASS_AVALOIR',(select id from nomad.style_definition where syd_code='ASS_AVALOIR_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.ass_avaloir')),
	 ('ASS_REGARD',(select id from nomad.style_definition where syd_code='ASS_REGARD_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.ass_regard')),
	 ('AEP_BRANCHE',(select id from nomad.style_definition where syd_code='AEP_BRANCHEMENT_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.aep_branche')),
	 ('ASS_BRANCHE',(select id from nomad.style_definition where syd_code='ASS_BRANCHEMENT_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.ass_branche')),
	 ('WORKORDER',(select id from nomad.style_definition where syd_code='WORKORDER_DEFAULT'),(select id from nomad.layer where lyr_table_name='asset.workorder'));