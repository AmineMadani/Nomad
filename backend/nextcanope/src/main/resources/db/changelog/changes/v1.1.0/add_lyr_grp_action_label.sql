ALTER TABLE nomad.layer_grp_action ADD COLUMN grp_label text;

COMMENT ON COLUMN nomad.layer_grp_action.grp_label IS 'Name of the group';

UPDATE nomad.layer_grp_action SET grp_label = 'Ponctuels (BAC / Fontes de voiries)' WHERE grp_id = 1;

ALTER TABLE nomad.layer_grp_action ALTER COLUMN grp_label SET NOT NULL;