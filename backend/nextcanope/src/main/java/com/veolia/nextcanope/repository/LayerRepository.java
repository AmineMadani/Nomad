package com.veolia.nextcanope.repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.veolia.nextcanope.dto.VLayerWtrDto;
import com.veolia.nextcanope.model.Layer;
import org.springframework.data.repository.query.Param;

public interface LayerRepository extends JpaRepository<Layer, Long> {
    Optional<Layer> findByLyrTableName(String lyrTableName);

    @Query(
            value = "select * from nomad.v_layer_wtr",
            nativeQuery = true
    )
    List<VLayerWtrDto> getAllVLayerWtr();

    @Query(
            value="select nomad.f_get_asset_ids_by_layers_and_filter_ids(" +
                    "   :listLyrTableName, " +
                    "   :listFilterId, " +
                    "   :filterType" +
                    ")",
            nativeQuery = true
    )
    List<LinkedHashMap<String, Object>> getAssetIdsByLayersAndFilterId(
        @Param("listLyrTableName") String listLyrTableName,
        @Param("listFilterId") String listFilterId,
        @Param("filterType") String filterType
    );
}
