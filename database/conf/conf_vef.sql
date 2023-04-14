-- Snapping tolerance of the underlying model, in map units
insert into config.float_setting values ('topo.snap_tolerance', 0.05 );

-- Set SRID
insert into config.text_setting values ('srid', 3857::integer);

-- insert raster Layer
insert into config.basemaps (alias, type, url, layer, matrixset, format, projection, tilegrid, style, attributions, "default", display)
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

insert into config.domain
  ( type    , parent_type,   alias             , short)
  values
  ( 'asset' , NULL       , 'Patrimoine'        , 'PAT'   ),
    ( 'dw'  , 'asset'    , 'Eau Potable'       , 'AEP'   ),
    ( 'ww'  , 'asset'    , 'Assainissement'    , 'ASS'   ),
  ( 'wo'    , NULL       , 'Intervention'      , 'INT'   ),
  ( 'geo'   , NULL       , 'Périmètre'         , 'GEO'   )
;

-- insert into tree
insert into config.tree
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

update config.tree set num_order = id ;


-- insert into application_object
insert into config.business_object
  (domain_type, type, topology_type )
  values
  ( 'dw' , 'dw_facility'       , 'node')
, ( 'dw' , 'dw_equipment'      , 'point')
, ( 'dw' , 'dw_valve'          , 'node')
, ( 'dw' , 'dw_water_meter'    , 'node')
, ( 'dw' , 'dw_regulation'     , 'node')
, ( 'dw' , 'dw_lateral_valve'  , 'lateral_point')
, ( 'dw' , 'dw_lateral_line'   , 'lateral_line')
, ( 'dw' , 'dw_purge'          , 'lateral_node')
, ( 'dw' , 'dw_public_eqpt'    , 'lateral_node')
, ( 'dw' , 'dw_hydrant'        , 'lateral_node')
, ( 'dw' , 'dw_delivery_point' , 'lateral_node')
, ( 'dw' , 'dw_pipe'           , 'arc')
, ( 'dw' , 'dw_abandoned_pipe' , null)
----
, ( 'ww' , 'ww_facility'       , 'node')
, ( 'ww' , 'ww_equipment'      , 'point')
, ( 'ww' , 'ww_manhole'        , 'node')
, ( 'ww' , 'ww_lateral_line'   , 'lateral_line')
, ( 'ww' , 'ww_connection'     , 'lateral_node')
, ( 'ww' , 'ww_intake'         , 'lateral_node')
, ( 'ww' , 'ww_pipe'           , 'arc')
, ( 'ww' , 'ww_abandoned_pipe' , null)
, ( 'ww' , 'ww_water_area'     , 'arc')
, ( 'ww' , 'ww_drain'          , 'arc')
, ( 'ww' , 'ww_fictive_pipe'   , 'arc')
----
, ( 'wo' , 'work_order'        , null)
, ('geo' , 'city'              , null)
, ('geo' , 'contract'          , null)
;


insert into config.layer
(
    domain_type
  , business_object_type
  , tree_group_id
  , simplified_tree_group_id
  , pg_table
  , geom_column_name
  , uuid_column_name
  , geom_srid
  , alias
)
values

  ( 'dw' , 'dw_facility'       , 102, 102, 'asset.aep_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage')
, ( 'dw' , 'dw_equipment'      , 103, 103, 'asset.aep_equipement', 'geom', 'uuid', '3857', 'Equipement')
, ( 'dw' , 'dw_lateral_valve'  , 106, 104, 'asset.aep_vanne_de_branche', 'geom', 'uuid', '3857', 'Vanne de branchement')
, ( 'dw' , 'dw_valve'          , 106, 103, 'asset.aep_vanne', 'geom', 'uuid', '3857', 'Vanne')
, ( 'dw' , 'dw_water_meter'    , 103, 103, 'asset.aep_compteur', 'geom', 'uuid', '3857', 'Compteur')
, ( 'dw' , 'dw_regulation'     , 103, 103, 'asset.aep_regulation', 'geom', 'uuid', '3857', 'Regulateur')
, ( 'dw' , 'dw_purge'          , 103, 103, 'asset.aep_purge', 'geom', 'uuid', '3857', 'Purge/Vidange')
, ( 'dw' , 'dw_public_eqpt'    , 103, 103, 'asset.aep_equipement_public', 'geom', 'uuid', '3857', 'Equipement public')
, ( 'dw' , 'dw_lateral_line'   , 104, 104, 'asset.aep_branche', 'geom', 'uuid', '3857', 'Branchement')
, ( 'dw' , 'dw_pipe'           , 100, 105, 'asset.aep_canalisation', 'geom', 'uuid', '3857', 'Canalisation')
, ( 'dw' , 'dw_abandoned_pipe' , 100, 105, 'asset.aep_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Canalisation abandonnée')
----
, ( 'ww' , 'ww_facility'       , 202, 202, 'asset.ass_ouvrage', 'geom', 'uuid', '3857', 'Ouvrage')
, ( 'ww' , 'ww_equipment'      , 203, 203, 'asset.ass_equipement', 'geom', 'uuid', '3857', 'Equipement')
, ( 'ww' , 'ww_connection'     , 203, 203, 'asset.ass_boite_de_branchement', 'geom', 'uuid', '3857', 'Boite de branchement')
, ( 'ww' , 'ww_intake'         , 203, 203, 'asset.ass_avaloir', 'geom', 'uuid', '3857', 'Avaloir / Grille')
, ( 'ww' , 'ww_manhole'        , 200, 203, 'asset.ass_regard', 'geom', 'uuid', '3857', 'Regard')
, ( 'ww' , 'ww_lateral_line'   , 204, 204, 'asset.ass_branche', 'geom', 'uuid', '3857', 'Branchement')
, ( 'ww' , 'ww_pipe'           , 200, 205, 'asset.ass_collecteur', 'geom', 'uuid', '3857', 'Collecteur')
, ( 'ww' , 'ww_abandoned_pipe' , 200, 205, 'asset.ass_canalisation_abandonnee', 'geom', 'uuid', '3857', 'Collecteur Abandonné')
, ( 'ww' , 'ww_water_area'     , 200, 205, 'asset.ass_surface_hydraulique', 'geom', 'uuid', '3857', 'Cours d''eau / fossé')
, ( 'ww' , 'ww_drain'          , 200, 205, 'asset.ass_drain', 'geom', 'uuid', '3857', 'Drain')
, ( 'ww' , 'ww_fictive_pipe'   , 200, 205, 'asset.ass_canalisation_fictive', 'geom', 'uuid', '3857', 'Canalisation fictive')
---
;

update config.layer set num_order = id ;

-- creating grid
with metro_grid as (
select config.ST_CreateFishnet(10, 10, 100000, 100000, 99040, 6125317) as res
),
temp_metro_grid as
(
select (st_setsrid((g.res).geom, 2154)) as geom
from metro_grid g
),
reunion_grid as (
select config.ST_CreateFishnet(1, 1, 66000, 66000, 314600, 7634100) as res
),
temp_reunion_grid as
(
select (st_setsrid((g.res).geom, 2975)) as geom
from reunion_grid g
)
insert into config.app_grid(geom)
select st_transform(geom, 3857) as geom from temp_metro_grid
union all
select st_transform(geom, 3857) as geom from temp_reunion_grid
;
