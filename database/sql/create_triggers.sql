\encoding UTF8

-- Creating the trigger function
CREATE OR REPLACE FUNCTION update_geom_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.longitude IS NOT NULL AND NEW.latitude IS NOT NULL THEN
    NEW.geom = ST_SetSRID(ST_GeomFromText('POINT(' || NEW.longitude || ' ' || NEW.latitude || ')'), 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Creating the trigger for workorders table
CREATE TRIGGER workorder_update_geom
BEFORE INSERT OR UPDATE OF longitude, latitude ON nomad.workorder
FOR EACH ROW EXECUTE PROCEDURE update_geom_trigger();

-- Creating the trigger for tasks table
CREATE TRIGGER task_update_geom
BEFORE INSERT OR UPDATE OF longitude, latitude ON nomad.task
FOR EACH ROW EXECUTE PROCEDURE update_geom_trigger();
