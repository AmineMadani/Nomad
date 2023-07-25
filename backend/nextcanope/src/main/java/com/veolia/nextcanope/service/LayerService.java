package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.veolia.nextcanope.exception.TechnicalException;

import com.veolia.nextcanope.dto.GetEquipmentsPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.LayerDto;
import com.veolia.nextcanope.dto.LayerStyleDto;
import com.veolia.nextcanope.dto.StyleDto;
import com.veolia.nextcanope.model.Layer;
import com.veolia.nextcanope.model.StyleDefinition;
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
     * Get all Layers.
     */
    public List<LayerDto> getLayers(Long userId) {
    	List<LayerDto> layersDto = new ArrayList<LayerDto>();
    	List<Layer> layers = layerRepository.findAll();
    	for(Layer layer:layers) {
    		LayerDto layerDto = new LayerDto(layer);
    		List<LayerStyleDto> lLayerStyle = layerStyleRepository.getLayerStyleByLayerAndUser(layerDto.getId(), userId);
    		for(LayerStyleDto layerStyle: lLayerStyle) {
    			Optional<StyleDefinition> optStyleDefinition = styleDefinitionRepository.findById(layerStyle.getDefinitionId());
                if (optStyleDefinition.isPresent()) {
                    StyleDefinition styleDefinition = optStyleDefinition.get();
                    styleDefinition.setSydCode(layerStyle.getCode());
                    layerDto.getListStyle().add(new StyleDto(styleDefinition));
                } else {
                    // We throw a technical exception if a definition is not found because it's an internal data error.
                    throw new TechnicalException("La définition " + layerStyle.getDefinitionId() + " n'existe pas.");
                }
    		}
    		layersDto.add(layerDto);
    	}
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
}
