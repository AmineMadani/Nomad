
-- aep_branche
update nomad.layer set lyr_style ='[{"id":"aep_branche_style_1","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_branche_style_2","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_branche_style_3","type":"symbol","source":"aep_branche","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.aep_branche';

-- aep_canalisation
update nomad.layer set lyr_style ='[{"id":"aep_canalisation_style_1","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_canalisation_style_2","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_canalisation_style_3","type":"symbol","source":"aep_canalisation","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.aep_canalisation';

/*
-- aep_vanne
update nomad.layer set lyr_style ='[{"id":"aep_vanne_style2","type":"circle","source":"aep_vanne","minzoom":18,"layout":{},"paint":{"circle-radius":30,"circle-color":"hsl(53, 59%, 79%)","circle-blur":0.5,"circle-opacity":["case",["boolean",["feature-state","hover"],false],1,0]}},{"id":"aep_vanne_style1","type":"symbol","source":"aep_vanne","minzoom":14,"layout":{"icon-allow-overlap":true,"icon-image":["match",["get","position"],["Fermé"],"AEP_VANNE_FERMEE","AEP_VANNE"],"icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"icon-size":["case",["==",["get","position"],"Fermé"],1,0.8],"symbol-spacing":10,"symbol-sort-key":["case",["==","position","Fermé"],1,2]},"paint":{}}]'
where 	lyr_table_name = 'asset.aep_vanne';
*/


-- aep_vanne 2/point
update nomad.layer set lyr_style ='[{"id":"aep_vanne_point_style","type":"circle","source":"aep_vanne","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(53, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name = 'asset.aep_vanne';


--asset.aep_ouvrage
update nomad.layer set lyr_style ='[{"id":"aep_ouvrage_point_style","type":"circle","source":"aep_ouvrage","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(49, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_ouvrage';


 
--asset.aep_equipement
update nomad.layer set lyr_style ='[{"id":"aep_equipement_point_style","type":"circle","source":"aep_equipement","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(57, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_equipement';


-- asset.aep_vanne_de_branche
update nomad.layer set lyr_style ='[{"id":"aep_vanne_de_branche_point_style","type":"circle","source":"aep_vanne_de_branche","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(60, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_vanne_de_branche';


--asset.aep_compteur
update nomad.layer set lyr_style ='[{"id":"aep_compteur_point_style","type":"circle","source":"aep_compteur","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(65, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_compteur';

--asset.aep_regulation
update nomad.layer set lyr_style ='[{"id":"aep_regulation_point_style","type":"circle","source":"aep_regulation","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(67, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_regulation';

--asset.aep_purge
update nomad.layer set lyr_style ='[{"id":"aep_purge_point_style","type":"circle","source":"aep_purge","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(70, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_purge';

-- asset.aep_equipement_public
update nomad.layer set lyr_style ='[{"id":"aep_equipement_public_purge_point_style","type":"circle","source":"aep_equipement_public","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(73, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_equipement_public';

--asset.aep_defense_incendie
update nomad.layer set lyr_style ='[{"id":"aep_defense_incendie_point_style","type":"circle","source":"aep_defense_incendie","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(76, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_defense_incendie';


-- asset.aep_point_desserte
update nomad.layer set lyr_style ='[{"id":"aep_point_desserte_point_style","type":"circle","source":"aep_point_desserte","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(79, 59%, 79%)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.aep_point_desserte';