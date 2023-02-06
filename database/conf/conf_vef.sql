-- Snapping tolerance of the underlying model, in map units
insert into settings.float_setting values ('topo.snap_tolerance', 0.05 );

-- Set SRID
insert into settings.text_setting values ('srid', :srid::integer);

-- Set Tile server
insert into settings.text_setting values ('tile_server', 'https://next-canope-dev-tiler.hp.hp.m-ve.com');

-- insert raster Layer
insert into config.raster_layer (alias, source, provider, visible)
values
('CartoDB',
 'crs=EPSG:3857&format&type=xyz&url=https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/%7Bz%7D/%7Bx%7D/%7By%7D.png&zmax=18&zmin=0',
 'wms',
 false),
 ('Esri topo',
 'crs=EPSG:3857&format&type=xyz&url=https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/%7Bz%7D/%7By%7D/%7Bx%7D&zmax=18&zmin=0',
 'wms',
 false),
 ('Google satellite',
 'crs=EPSG:3857&format&type=xyz&url=https://mt1.google.com/vt/lyrs%3Ds%26x%3D%7Bx%7D%26y%3D%7By%7D%26z%3D%7Bz%7D&zmax=18&zmin=0',
 'wms',
 false),
 ('OpenStreetMap',
 'crs=EPSG:3857&format&type=xyz&url=https://tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png&zmax=19&zmin=0',
 'wms',
 false),
('IGN (Plan)',
 'crs=EPSG:3857&dpiMode=7&format=image/png&layers=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&styles=normal&tileMatrixSet=PM&url=https://wxs.ign.fr/essentiels/geoportail/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities',
 'wms',
 false),
('IGN (Orthophoplan)',
 'crs=EPSG:3857&dpiMode=7&format=image/jpeg&layers=ORTHOIMAGERY.ORTHOPHOTOS&styles=normal&tileMatrixSet=PM&url=https://wxs.ign.fr/essentiels/geoportail/wmts?SERVICE%3DWMTS%26REQUEST%3DGetCapabilities',
 'wms',
 True)
;


-- insert into application_domain
insert into config.application_domain
  (id, type , alias                                         , short)
  values
  ( 1, 'dw' , 'Adduction / Distribution Eau Potable'        , 'AEP'   )
, ( 2, 'ww' , 'Collecte / Traitement Assainissement'        , 'ASS'   )
, ( 3, 'sw' , 'Collecte Eaux Pluviales'                     , 'EPL'   )
, (10,'geo' , 'Référentiel géographiques'                   , 'GEO'   )
;

insert into config.layer_tree
  (id, parent_group, alias)
  values
  ( 1,      NULL      , 'Réseau eau potable'),
      ( 11, 1         , 'Ouvrages eau potable'),
      ( 12, 1         , 'Equipement eau potable'),
      ( 13, 1         , 'Branche eau potable'),
  ( 2,      NULL      , 'Réseau assainissement'),
      ( 21, 2         , 'Ouvrages assainissement'),
      ( 22, 2         , 'Equipement assainissement'),
      ( 23, 2         , 'Branche assainissement'),
  ( 3,      NULL      , 'Réseau eau pluviale'),
      ( 31, 3         , 'Ouvrages eau pluviale'),
      ( 32, 3         , 'Equipement eau pluviale'),
      ( 33, 3         , 'Branche eau pluviale')
;


insert into config.layer
(name, parent_group, application_domain_type, pg_table, geom_column_name, geom_srid, alias)
values
  ('pipe' , 1, 'dw', 'asset_data.aep_canalisation', 'geom', '2154', 'Canalisation AEP')
, ('facility' , 11, 'dw', 'asset_data.aep_ouvrage', 'geom', '2154', 'Ouvrage AEP')
, ('valve' , 12, 'dw', 'asset_data.aep_vanne', 'geom', '2154', 'Vanne AEP')
, ('lateral_line' , 12, 'dw', 'asset_data.aep_branche', 'geom', '2154', 'Branchement AEP')
, ('hydrant' , 13, 'dw', 'asset_data.aep_defense_incendie', 'geom', '2154', 'Défense incendie AEP')
, ('pipe' , 2, 'ww', 'asset_data.ass_collecteur', 'geom', '2154', 'Collecteur ASS')
, ('facility' , 21, 'ww', 'asset_data.ass_ouvrage', 'geom', '2154', 'Ouvrage ASS')
, ('manhole' , 22, 'ww', 'asset_data.ass_regard', 'geom', '2154', 'Regard ASS')
, ('lateral_line' , 23, 'ww', 'asset_data.ass_branche', 'geom', '2154', 'Branchement ASS')
, ('intake' , 22, 'dw', 'asset_data.ass_avaloir', 'geom', '2154', 'Avaloir/Grille ASS')
;
