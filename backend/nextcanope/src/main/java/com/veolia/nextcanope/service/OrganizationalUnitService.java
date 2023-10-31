package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.OrganizationalUnitDto;
import com.veolia.nextcanope.model.OrganizationalUnit;
import com.veolia.nextcanope.repository.OrganizationalUnitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * CityService is a service class for managing asset-related data.
 * It interacts with the cityRepository to access and manipulate the data.
 */
@Service
public class OrganizationalUnitService {
    @Autowired
	OrganizationalUnitRepository organizationalUnitRepository;

	/**
	 * Get the list of organizational unit from the database
	 * It maps the organizational unit list to a list of organizational unit DTO
	 * @return the list of organizational unit
	 */
	public List<OrganizationalUnitDto> getAllOrganizationalUnits() {
		List<OrganizationalUnit> organizationalUnits = this.organizationalUnitRepository.findAll();

		return organizationalUnits.stream().map(OrganizationalUnitDto::new).toList();
	}
}
