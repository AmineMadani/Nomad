/**** It's not finished yet ****/

-- Create temporary table to store CSV data
CREATE TABLE config.temp_layer_references(
   affichage TEXT,
   champs TEXT,
   colonnes TEXT
);

-- Load .csv file into temporary table
--psql -U postgres -d nomad-local -p 5480 -c "\copy config.temp_layer_references(affichage, champs, colonnes) FROM 'C:\Users\a833157\Downloads\modele_layer_reference.csv' DELIMITER ',' CSV HEADER;"
COPY config.temp_layer_references(affichage, champs, colonnes) 
FROM './modele_layer_reference.csv'
WITH (FORMAT csv, DELIMITER ',', HEADER);

-- Fill "config.layer_references" && "config.layer_references_default" tables with temporary
DO $$
    DECLARE
        current_layer_id INT;
        current_position INT := 0;
        layer_rec RECORD;
    BEGIN
        FOR layer_rec IN
            select l.id as layer_id
            FROM config.layer l
            LOOP
                current_layer_id := layer_rec.layer_id;
                current_position := 0;

                DECLARE
                    row_rec RECORD;
                BEGIN
                    FOR row_rec IN
                        select c.column_name from information_schema.columns as c
                            inner join config.layer as l on ('patrimony.' || c.table_name) = l.pg_table::text
                        where l.id = current_layer_id and c.table_schema = 'patrimony' and (c.table_name like 'aep%' or c.table_name like 'ass%')
                        LOOP
                        -- If key is present in csv file retrieve label
                        -- Otherwise set label to key
                            DECLARE
                                alias_to_insert VARCHAR(63) := row_rec.column_name;
                                new_layer_reference_id INT;
                            BEGIN
                                SELECT champs
                                FROM config.temp_layer_references
                                WHERE colonnes = row_rec.column_name
                                INTO alias_to_insert;

                                IF alias_to_insert IS NOT NULL THEN
                                    -- Insert data into "config.layer_references" table
                                    INSERT INTO config.layer_references (
                                        layer_id,
                                        reference_key,
                                        alias
                                    )
                                    VALUES (
                                       current_layer_id,
                                       row_rec.column_name,
                                       alias_to_insert
                                   ) RETURNING id into new_layer_reference_id;

                                    -- Insert data into "config.layer_references_default" table
                                    INSERT INTO config.layer_references_default (
                                        layer_reference_id,
                                        position,
                                        display_type
                                    ) VALUES (
                                        new_layer_reference_id,
                                        current_position,
                                        'SYNTHETIC'
                                    );
                                END IF;
                            END;

                            current_position := current_position + 1;
                        END LOOP;
                END;
            END LOOP;
    END
$$;

-- Drop temporary table
DROP TABLE config.temp_layer_references;