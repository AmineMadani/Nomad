package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.City;
import com.veolia.nextcanope.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CityService is a service class for managing asset-related data.
 * It interacts with the cityRepository to access and manipulate the data.
 */
@Service
public class CityService {

    @Autowired
	CityRepository cityRepository;

	public City getCityById(Long cityId) {
		return this.cityRepository.findById(cityId).orElseThrow(() -> new FunctionalException("La ville avec l'id " + cityId + " n'existe pas."));
	}

	public List<Long> getCityIdsByLatitudeLongitude(Double latitude, Double longitude) {
		return this.cityRepository.getCityIdsByLatitudeLongitude(latitude, longitude);
	}

	public List<CityDto> getAllUserCities(Long userId) {
		return this.cityRepository.getAllUserCities(userId);
	}
}
