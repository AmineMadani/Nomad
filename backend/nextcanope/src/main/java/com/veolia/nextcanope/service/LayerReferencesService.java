package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesFlatDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferenceUserDto;
import com.veolia.nextcanope.enums.LayerReferencesDisplayType;
import com.veolia.nextcanope.model.LayerReferencesUser;
import com.veolia.nextcanope.repository.LayerReferencesRepository;
import com.veolia.nextcanope.repository.LayerReferencesUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * LayerReferencesService is a service class for managing layer references-related data.
 * It interacts with the layerReferencesRepository to access and manipulate the data.
 */
@Service
public class LayerReferencesService {
    @Autowired
    private LayerReferencesRepository layerReferencesRepository;

    @Autowired
    private LayerReferencesUserRepository layerReferencesUserRepository;

    /**
     * Retrieves the user list of layer references.
     * @return the list of layer references.
     */
    public List<LayerReferencesDto> getUserLayerReferences(Long userId) {
        // Result list of the query
        List<LayerReferencesFlatDto> listFlatDto = layerReferencesRepository.getLayerReferencesWithUserId(userId);

        // Transform the result list to a list of LayerReferencesDto
        return mapFlatDtoToLayerReferenceDto(listFlatDto);
    }

    /**
     * Retrieves the default list of layer references.
     * @return the list of layer references.
     */
    public List<LayerReferencesDto> getDefaultLayerReferences() {
        // Result list of the query
        List<LayerReferencesFlatDto> listFlatDto = layerReferencesRepository.getDefaultLayerReferences();

        // Transform the result list to a list of LayerReferencesDto
        return mapFlatDtoToLayerReferenceDto(listFlatDto);
    }

    /**
     * Transform a list of LayerReferencesFlatDto to a list of LayerReferencesDto.
     * @param listFlatDto the list of LayerReferencesFlatDto.
     * @return the list of LayerReferencesDto.
     */
    private List<LayerReferencesDto> mapFlatDtoToLayerReferenceDto(List<LayerReferencesFlatDto> listFlatDto) {
        List<LayerReferencesDto> layerReferences = new ArrayList<>();

        // Group the list by layer key
        listFlatDto.stream()
                .collect(Collectors.groupingBy(LayerReferencesFlatDto::getLayer))
                .forEach((String layerKey, List<LayerReferencesFlatDto> group) -> {
                    LayerReferencesDto resultLayer = new LayerReferencesDto();
                    resultLayer.setLayerKey(layerKey.split("\\.")[1]);

                    List<LayerReferenceUserDto> references = group.stream().map(LayerReferenceUserDto::new).collect(Collectors.toList());

                    resultLayer.setReferences(references);
                    layerReferences.add(resultLayer);
                });
        return layerReferences;
    }

    /**
     * Save the new layer references configuration of a list of user.
     * It read all userIds and userReferences to create or update a LayerReferencesUser object.
     * @param userReferences to apply
     * @param userIds concerned
     * @param currentUserId for log
     */
    public void saveUserLayerReferences(List<LayerReferenceUserDto> userReferences, List<Long> userIds, Long currentUserId) {
        List<LayerReferencesUser> layerReferencesUsers = new ArrayList<>();

        for (Long userId : userIds) {
            for (LayerReferenceUserDto ref : userReferences) {
                LayerReferencesUser layerReferencesUser = new LayerReferencesUser();

                // It checks if a reference already exist with the same lrfId and lruUserId
                Optional<LayerReferencesUser> optLayerReferencesUser = this.layerReferencesUserRepository.findByLrfIdAndLruUserId(ref.getReferenceId(), userId);
                if (optLayerReferencesUser.isPresent()) {
                    layerReferencesUser = optLayerReferencesUser.get();
                }

                layerReferencesUser.setLruUserId(userId);
                layerReferencesUser.setLrfId(ref.getReferenceId());
                layerReferencesUser.setLruIsvisible(ref.getIsVisible());
                layerReferencesUser.setLruPosition(ref.getPosition());
                layerReferencesUser.setLruDisplayType(LayerReferencesDisplayType.valueOf(ref.getDisplayType()));
                layerReferencesUser.setLruValid(ref.getValid());
                layerReferencesUser.setLruSection(ref.getSection());
                layerReferencesUser.setLruUcreId(currentUserId);

                layerReferencesUsers.add(layerReferencesUser);
            }
        }

        // It saves layer references user in the db
        this.layerReferencesUserRepository.saveAll(layerReferencesUsers);
    }
}
