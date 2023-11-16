ALTER TABLE nomad.workorder ADD COLUMN wko_planning_duration integer;
COMMENT ON COLUMN nomad.workorder.wko_planning_duration IS 'Planning duration of the workorder';