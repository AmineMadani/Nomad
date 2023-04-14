package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesFlatDto;
import com.veolia.nextcanope.dto.LayerReference.UserReferenceDto;
import com.veolia.nextcanope.repository.LayerReferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * LayerReferencesService is a service class for managing layer references-related data.
 * It interacts with the layerReferencesRepository to access and manipulate the data.
 */
@Service
public class LayerReferencesService {
    @Autowired
    private LayerReferencesRepository layerReferencesRepository;

    /**
     * Retrieves the user list of layer references.
     * @return the list of layer references.
     */
    public List<LayerReferencesDto> getUserLayerReferences(Integer userId) {
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

                    List<UserReferenceDto> references = group.stream().map(item -> {
                        // Convertir l'alias de ISO-8859-1 en UTF-8
                        byte[] isoBytes = item.getAlias().getBytes(StandardCharsets.ISO_8859_1);
                        String alias = new String(isoBytes, StandardCharsets.UTF_8);

                        return new UserReferenceDto(
                                item.getReferenceId(),
                                item.getReferenceKey(),
                                alias,
                                item.getDisplayType(),
                                item.getPosition(),
                                item.getIsVisible(),
                                item.getSection()
                        );
                    }).collect(Collectors.toList());

                    resultLayer.setReferences(references);
                    layerReferences.add(resultLayer);
                });
        return layerReferences;
    }
}
