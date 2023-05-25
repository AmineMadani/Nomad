
-- aep_branche
update nomad.layer set lyr_style ='[{"id":"aep_branche_style_1","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_branche_style_2","type":"line","source":"aep_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_branche_style_3","type":"symbol","source":"aep_branche","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.aep_branche';

-- aep_canalisation
update nomad.layer set lyr_style ='[{"id":"aep_canalisation_style_1","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[3,2]]},"filter":["!=",["get","ecoulement"],"Gravitaire"]},{"id":"aep_canalisation_style_2","type":"line","source":"aep_canalisation","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":["case",["boolean",["feature-state","selected"],false],6,["boolean",["feature-state","hover"],false],8,["==",["get","ecoulement"],"Refoulement"],4,["==",["get","ecoulement"],"Surpressé"],3,3],"line-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"line-dasharray":["literal",[1,2]]},"filter":["==","$type","LineString"]},{"id":"aep_canalisation_style_3","type":"symbol","source":"aep_canalisation","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.aep_canalisation';



-- aep_vanne
update nomad.layer set lyr_style ='[{"id":"aep_vanne_style2","type":"circle","source":"aep_vanne","minzoom":18,"layout":{},"paint":{"circle-radius":30,"circle-color":"hsl(53, 59%, 79%)","circle-blur":0.5,"circle-opacity":["case",["boolean",["feature-state","hover"],false],1,0]}},{"id":"aep_vanne_style1","type":"symbol","source":"aep_vanne","minzoom":14,"layout":{"icon-allow-overlap":true,"icon-image":["match",["get","position"],["Fermé"],"AEP_VANNE_FERMEE","AEP_VANNE"],"icon-rotate":["+",["get","angle"],90],"icon-rotation-alignment":"map","icon-ignore-placement":true,"icon-size":["case",["==",["get","position"],"Fermé"],1,0.8],"symbol-spacing":10,"symbol-sort-key":["case",["==","position","Fermé"],1,2]},"paint":{}}]' where 	lyr_table_name = 'asset.aep_vanne';


--asset.aep_ouvrage
update nomad.layer set lyr_style ='[{"id":"aep_ouvrage","type":"symbol","source":"composite","source-layer":"aep_ouvrage","layout":{"icon-image":["match",["get","type"],["Réservoir(surtour)"],"AEP_RESERVOIR_TOUR",["Réservoir(semienterré)"],"RESERVOIR_SEMI",["Station pompage", "Station de reprise"],["Usinedetraitement"],"AEP_USINE_TRAITEMENT"," "]},"paint":{}}]'
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

-- asset.ass_ouvrage
update nomad.layer set lyr_style ='[{"id":"ass_ouvrage_point_style","type":"circle","source":"ass_ouvrage","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(345, 34%, 42)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.ass_ouvrage';


-- asset.ass_equipement
 
update nomad.layer set lyr_style ='[{"id":"ass_equipement_point_style","type":"circle","source":"ass_equipement","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(345, 20%, 20)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.ass_equipement';


-- asset.ass_boite_de_branchement
update nomad.layer set lyr_style ='[{"id":"ass_boite_de_branchement_point_style","type":"circle","source":"ass_boite_de_branchement","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(345, 20%, 20)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.ass_boite_de_branchement';

-- asset.ass_avaloir
update nomad.layer set lyr_style ='[{"id":"ass_avaloir_point_style","type":"circle","source":"ass_avaloir","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(330, 20%, 20)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.ass_avaloir';


-- asset.ass_regard
update nomad.layer set lyr_style ='[{"id":"ass_regard_point_style","type":"circle","source":"ass_regard","minzoom":10,"layout":{},"paint":{"circle-radius":["case",["boolean",["feature-state","selected"],false],20,["boolean",["feature-state","hover"],false],12,7.5],"circle-color":"hsl(330, 20%, 20)","circle-blur":0.1,"circle-opacity":["case",["boolean",["feature-state","selected"],false],1,["boolean",["feature-state","hover"],false],1,0.7]}}]'
where 	lyr_table_name ='asset.ass_regard';


-- asset.aep_canalisation_abandonnee
update nomad.layer set lyr_style ='[{"id":"aep_canalisation_abandonnee_style_1","type":"line","source":"aep_canalisation_abandonnee","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#00A1FA"]],"line-dasharray":["literal",[1,1]]},{"id":"aep_canalisation_abandonnee_3","type":"symbol","source":"aep_canalisation_abandonnee","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.aep_canalisation_abandonnee';


-- asset.ass_branche
update nomad.layer set lyr_style ='[{"id":"ass_branche_style_1","type":"line","source":"ass_branche","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#A1A1EA"},"line-dasharray":["literal",[3,2]]},{"id":"ass_branche_3","type":"symbol","source":"ass_branche","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.ass_branche';

-- asset.ass_collecteur
update nomad.layer set lyr_style ='[{"id":"ass_collecteur_style_1","type":"line","source":"ass_collecteur","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#00A1EA"},"line-dasharray":["literal",[3,2]]},{"id":"ass_collecteur_style_3","type":"symbol","source":"ass_collecteur","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.ass_collecteur';


-- asset.ass_canalisation_abandonnee
update nomad.layer set lyr_style ='[{"id":"ass_canalisation_abandonnee_style_1","type":"line","source":"ass_canalisation_abandonnee","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#00A9EF"},"line-dasharray":["literal",[1,1]]},{"id":"ass_canalisation_abandonnee_style_3","type":"symbol","source":"ass_canalisation_abandonnee","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.ass_canalisation_abandonnee';


-- asset.ass_drain
update nomad.layer set lyr_style ='[{"id":"ass_drain_style_1","type":"line","source":"ass_drain","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#00A5E9"},"line-dasharray":["literal",[1,1]]},{"id":"ass_drain_syle_3","type":"symbol","source":"ass_drain","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.ass_drain';


-- asset.ass_canalisation_fictive
update nomad.layer set lyr_style ='[{"id":"ass_canalisation_fictive_style_1","type":"line","source":"ass_canalisation_fictive","minzoom":10,"layout":{"line-cap":"round","line-join":"round","visibility":"visible"},"paint":{"line-width":4,"line-color":"#00A5E9"},"line-dasharray":["literal",[0.5,0.5]]},{"id":"ass_canalisation_fictive_syle_3","type":"symbol","source":"ass_canalisation_fictive","minzoom":16,"layout":{"text-size":12,"text-allow-overlap":true,"symbol-spacing":159,"symbol-placement":"line","text-rotation-alignment":"map","text-anchor":"top","text-pitch-alignment":"map","text-field":["to-string",["get","id"]]},"paint":{"text-color":["case",["boolean",["feature-state","selected"],false],"#FFC0CB",["!=",["get","exploitant"],"Veolia"],"#000000",["coalesce",["get","cde_rvb"],"#00A1FF"]],"text-halo-width":10,"text-halo-color":"hsla(0, 0%, 96%, 0)"}}]'
where 	lyr_table_name = 'asset.ass_canalisation_fictive';
















