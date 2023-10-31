package com.veolia.nextcanope.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.veolia.nextcanope.dto.VLayerWtrDto;
import com.veolia.nextcanope.model.Layer;

public interface LayerRepository extends JpaRepository<Layer, Long> {
    Optional<Layer> findByLyrTableName(String lyrTableName);

    @Query(
            value = "select * from nomad.v_layer_wtr",
            nativeQuery = true
    )
    List<VLayerWtrDto> getAllVLayerWtr();
}
