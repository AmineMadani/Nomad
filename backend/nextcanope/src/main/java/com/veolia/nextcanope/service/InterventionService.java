package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.InterventionDto;
import com.veolia.nextcanope.model.Intervention;
import com.veolia.nextcanope.repository.InterventionRepository;

/**
 * InterventionService is a service class for managing intervention-related data.
 * It interacts with the InterventionRepository to access and manipulate the data.
 */
@Service
public class InterventionService {

    @Autowired
    private InterventionRepository interventionRepository;

    /**
	 * Retrieve the list of intervention by most recent date begin limited in number with offset for pagination
	 * @param limitNb The number of intervention to get
	 * @param offset The pagination offset to set
	 * @return the intervention list
	 */
    public List<InterventionDto> getInterventionsWithOffsetOrderByMostRecentDateBegin(Long limit, Long offset) {
    	List<Intervention> lInterventionEntity = interventionRepository.getInterventionsWithOffsetOrderByMostRecentDateBegin(limit, offset);
    	List<InterventionDto> lInterventionDto = new ArrayList<InterventionDto>();
    	lInterventionEntity.forEach(interventionEntity -> {
    		lInterventionDto.add(new InterventionDto(interventionEntity));
    	});
        return lInterventionDto;
    }
}
