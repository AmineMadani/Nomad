package com.veolia.nextcanope.service;

import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.model.Contract;
import com.veolia.nextcanope.repository.ContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}
