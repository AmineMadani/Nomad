package com.veolia.nextcanope.service;

import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.City;
import com.veolia.nextcanope.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
