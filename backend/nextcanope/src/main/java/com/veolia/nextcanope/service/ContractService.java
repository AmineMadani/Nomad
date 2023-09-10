package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.Contract.ContractOrgDto;
import com.veolia.nextcanope.dto.Contract.ContractOrgProjectionDto;
import com.veolia.nextcanope.dto.Contract.ContractDto;
import com.veolia.nextcanope.dto.OrganizationalUnitDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.Contract;
import com.veolia.nextcanope.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CityService is a service class for managing asset-related data.
 * It interacts with the cityRepository to access and manipulate the data.
 */
@Service
public class ContractService {
    @Autowired
	ContractRepository contractRepository;

	public Contract getContractById(Long contractId) {
		return this.contractRepository.findById(contractId).orElseThrow(() -> new FunctionalException("Le contrat avec l'id " + contractId + " n'existe pas."));
	}

	public List<ContractDto> getAllUserContracts(Long userId) {
		return this.contractRepository.getAllUserContracts(userId);
	}

	/**
	 * We can't use a find all method because of the bad performance it offers.
	 * Even with entityGraph, fetchType.EAGER and all of that stuff, hibernate struggle to perform a good request
	 * Because of all the dependencies between tables with users.
	 * @return List of contract dto
	 */
	public List<ContractOrgDto> getAllContractsWithOrganizationalUnits() {
		List<ContractOrgProjectionDto> contractOrgProjectionDtos = this.contractRepository.getAllContractWithOrganizationalUnits();

		List<ContractOrgDto> contractOrgDtos = new ArrayList<>();

		// Group the projections by contract ID
		contractOrgProjectionDtos.stream()
				.collect(Collectors.groupingBy(ContractOrgProjectionDto::getId))
				.forEach((Long contractId, List<ContractOrgProjectionDto> projections) -> {
					// The contract details (like ctrCode, ctrSlabel, etc.) are the same for all entries in the group
					// So, we take the first element
					ContractOrgDto contractOrgDto = new ContractOrgDto(projections.get(0));

					// Convert each projection in the group to an OrganizationalUnitDto
					List<OrganizationalUnitDto> organizationalUnitDtos = projections.stream()
							.filter(p -> p.getOrgId() != null)
							.map(OrganizationalUnitDto::new)
							.collect(Collectors.toList());

					contractOrgDto.setOrganizationalUnits(organizationalUnitDtos);
					contractOrgDtos.add(contractOrgDto);
				});

		return contractOrgDtos;
	}

	public List<Long> getContractIdsByLatitudeLongitude(Double latitude, Double longitude) {
		return this.contractRepository.getContractIdsByLatitudeLongitude(latitude, longitude);
	}
}
