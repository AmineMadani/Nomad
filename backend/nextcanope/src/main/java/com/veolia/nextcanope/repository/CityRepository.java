package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.dto.Contract.ContractDto;
import com.veolia.nextcanope.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * CityRepository is an interface for managing City entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface CityRepository extends JpaRepository<City, Long> {
    @Query(value = "SELECT id " +
            "FROM nomad.city cty " +
            "WHERE ST_Intersects(cty.geom, st_transform(st_setsrid(st_geomfromtext('POINT('||':longitude'|| ' '||':latitude'||')'),4326),3857))",
            nativeQuery = true
    )
    List<Long> getCityIdsByLatitudeLongitude(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude
    );

    @Query("select c from City c ")
    List<CityDto> getAllCities();
}
