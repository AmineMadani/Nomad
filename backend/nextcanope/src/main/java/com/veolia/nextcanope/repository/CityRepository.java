package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.model.City;

/**
 * CityRepository is an interface for managing City entities in the persistence
 * layer. It extends JpaRepository, which provides generic CRUD operations.
 */
public interface CityRepository extends JpaRepository<City, Long> {
	@Query(value = "SELECT id " + "FROM nomad.city cty "
				+ "WHERE ST_Intersects(cty.geom, ST_SetSRID(ST_MakePoint(:longitude, :latitude),4326))"
			, nativeQuery = true)
	List<Long> getCityIdsByLatitudeLongitude(@Param("latitude") Double latitude, @Param("longitude") Double longitude);

	@Query(value = "select cty.id, cty.cty_code as ctyCode, cty.cty_slabel as ctySlabel, cty.cty_llabel as ctyLlabel, cty.cty_valid as ctyValid from nomad.city cty where "
				+ "st_intersects(ST_MakeValid(cty.geom), "
				+ "	(select st_union(ST_MakeValid(geom)) from nomad.contract ctr join nomad.usr_ctr_prf ucp on ucp.ctr_id=ctr.id and ucp.usr_id = :userId and ucp.usc_ddel is null))"
			, nativeQuery = true)
	List<CityDto> getAllUserCities(@Param("userId") Long userId);
}
