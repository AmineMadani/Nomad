ALTER TABLE nomad.asset_type
DROP COLUMN ast_geom_type;

ALTER TABLE nomad.layer
ADD COLUMN lyr_geom_type VARCHAR(255);

UPDATE nomad.layer
SET lyr_geom_type =
    CASE
        WHEN lyr_table_name = 'aep_branche' OR
             lyr_table_name = 'aep_canalisation' OR
             lyr_table_name = 'aep_canalisation_abandonnee' OR
             lyr_table_name = 'ass_branche' OR
             lyr_table_name = 'ass_collecteur' OR
             lyr_table_name = 'ass_canalisation_abandonnee' OR
             lyr_table_name = 'ass_canalisation_fictive'
             THEN 'line'
        ELSE 'point'
    END;

CREATE TABLE IF NOT EXISTS layer_grp_action
(
    id           bigserial primary key,
    grp_id       bigint not null,
    wtr_id       bigint not null references workorder_task_reason(id),
    lyr_id       bigint not null references layer(id)
);

COMMENT ON COLUMN layer_grp_action.grp_id IS 'ID of the table';
COMMENT ON COLUMN layer_grp_action.grp_id IS 'ID for a specific group of layers related to the same action';
COMMENT ON COLUMN layer_grp_action.wtr_id IS 'ID of the action linked to the layer';
COMMENT ON COLUMN layer_grp_action.lyr_id IS 'ID of the layer linked to the action';

insert into layer_grp_action (grp_id, wtr_id, lyr_id) values
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_vanne')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_compteur')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_raccord')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_purge')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_equipement')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'aep_regulation')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'ass_avaloir')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'ass_regard')),
    (1, (select id from workorder_task_reason wtr where wtr.wtr_code = '17'), (select id from layer lyr where lyr.lyr_table_name = 'ass_equipement'));