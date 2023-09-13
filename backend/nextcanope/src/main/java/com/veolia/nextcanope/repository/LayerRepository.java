package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.VLayerWtrDto;
import com.veolia.nextcanope.model.Layer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface LayerRepository extends JpaRepository<Layer, Long> {
    Optional<Layer> findByLyrTableName(String lyrTableName);

    @Query(
            value = "select * from nomad.v_layer_wtr",
            nativeQuery = true
    )
    List<VLayerWtrDto> getAllVLayerWtr();



    /**
     * Retrieves the list of layer tiles associated with a specific key and list tiles number.
     *
     * @param key        The key to search for in the database.
     * @param listTileNumber The list Tile Number to search for in the database.
     * @return The List layer tile as a list of string, associated with the given key and list tile number.
     */
    @Query(
        value="select * from nomad.f_get_geojson_from_list_tiles(:key, ARRAY[:listTileNumber], :userId);",
        nativeQuery = true
    )
    List<Map<String, Object>> getListLayerTile(
        @Param("key") String key,
        @Param("listTileNumber") Long[] listTileNumber,
        @Param("userId") Long userId
    );
}
