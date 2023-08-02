package com.veolia.nextcanope.service;

import java.util.*;

import com.veolia.nextcanope.dto.*;
import com.veolia.nextcanope.dto.LayerStyle.StyleDefinitionDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;

import com.veolia.nextcanope.dto.payload.GetEquipmentsPayload;
import com.veolia.nextcanope.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.repository.LayerRepository;
import com.veolia.nextcanope.repository.LayerRepositoryImpl;
import com.veolia.nextcanope.repository.LayerStyleRepository;
import com.veolia.nextcanope.repository.StyleDefinitionRepository;

/**
 * PatrimonyService is a service class for managing patrimony-related data.
 * It interacts with the PatrimonyRepositoryImpl to access and manipulate the data.
 */
@Service
public class LayerService {

    @Autowired
    private LayerRepositoryImpl layerRepositoryImpl;
    
    @Autowired
    private LayerRepository layerRepository;
    
    @Autowired
    private LayerStyleRepository layerStyleRepository;
    
    @Autowired
    private StyleDefinitionRepository styleDefinitionRepository;

    /**
     * Retrieves the index associated with a specific key.
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
    public String getIndexByKey(String key) {
        return layerRepositoryImpl.getIndexByKey(key);
    }

    /**
     * Retrieves the equipment tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @return The equipment tile as a string, associated with the given key and tile number.
     */
    public String getLayerTile(String key, Long tileNumber, Long userId) {
        return layerRepositoryImpl.getLayerTile(key, tileNumber, userId);
    }
    
    /**
     * Get all Layers. For each layer, get the styles of the layer and the user.
     * @param userId The user id
     * @return A list of LayerDto
     */
    public List<LayerDto> getLayers(Long userId) {
    	List<LayerDto> layersDto = new ArrayList<LayerDto>();
        // Get all layers
    	List<Layer> layers = layerRepository.findAll();
    	for (Layer layer : layers) {
    		LayerDto layerDto = new LayerDto(layer);
            // Get the styles of the layer and the user
    		List<StyleDefinitionDto> layerDefinitionsDto = layerStyleRepository.getLayerStyleByLayerAndUser(layerDto.getId(), userId);
            // Build the LayerStyleDetailDto list
            for (StyleDefinitionDto styleDefinitionDto : layerDefinitionsDto) {
                // Get the style definition, if it doesn't exist, throw an exception
    			StyleDefinition styleDefinition = styleDefinitionRepository
                            .findById(styleDefinitionDto.getDefinitionId())
                            .orElseThrow(() -> new TechnicalException("La définition " + styleDefinitionDto.getDefinitionId() + " n'existe pas."));
                // Get the first layer style of the style definition (there is only one for sure)
                LayerStyle layerStyleOfDefinition = styleDefinition.getListOfLayerStyle().get(0);
                // Add the layer style to the list
                layerDto.getListStyle().add(new LayerStyleDetailDto(layerStyleOfDefinition));
    		}
            // Add the layer to the list
    		layersDto.add(layerDto);
    	}
        // Return the list of layers with their styles
        return layersDto;
    }
    
    /**
     * Retrieve the equipment by layer and id
     *
     * @param layer The layer
     * @param id The object id
     * @return the equipment
     */
	public List<Map<String, Object>> getEquipmentByLayerAndId(String layer, String id) {
        return layerRepositoryImpl.getEquipmentByLayerAndId(layer, id);
    }

    public List<Map<String, Object>> getEquipmentsByLayersAndIds(List<GetEquipmentsPayload> equipmentsPayload) {
        List<Map<String, Object>> features = new ArrayList<Map<String,Object>>();
        for(GetEquipmentsPayload payload : equipmentsPayload) {
            List<Map<String, Object>> layerFeatures = this.layerRepositoryImpl.getEquipmentsByLayerAndIds(payload.getLyrTableName(), payload.getEquipmentIds());
            features.addAll(layerFeatures);
        }
        return features;
    }

    public Layer getLayerByLyrTableName(String lyrTableName) {
        return this.layerRepository
                .findByLyrTableName(lyrTableName)
                .orElseThrow(() -> new FunctionalException("Le Layer avec la clé  " + lyrTableName + " n'existe pas."));
    }
}
