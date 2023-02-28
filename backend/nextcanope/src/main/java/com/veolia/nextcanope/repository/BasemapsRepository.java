package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Basemaps;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BasemapsRepository extends JpaRepository<Basemaps, Long> {

    List<Basemaps> findByDisplay(Boolean display);
}
