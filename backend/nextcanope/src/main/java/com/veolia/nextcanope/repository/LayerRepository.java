package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Layer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LayerRepository extends JpaRepository<Layer, Long> {
    Optional<Layer> findByLyrTableName(String lyrTableName);
}
