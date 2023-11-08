package com.veolia.nextcanope.service;

import java.util.*;
import java.util.stream.Collectors;

import com.veolia.nextcanope.dto.LayerGrpActionDTO;
import com.veolia.nextcanope.model.LayerGrpAction;
import com.veolia.nextcanope.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.LayerWithStylesDto;
import com.veolia.nextcanope.dto.VLayerWtrDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.dto.LayerStyle.StyleDefinitionDto;
import com.veolia.nextcanope.dto.payload.GetEquipmentsPayload;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.Layer;
import com.veolia.nextcanope.model.LayerStyle;
import com.veolia.nextcanope.model.StyleDefinition;

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

    @Autowired
    private LayerGrpActionRepository layerGrpActionRepository;

    /**
     * Retrieves the index associated with a specific key.
     * @param userId 
     *
     * @param key The key to search for in the database.
     * @return The index as a string, associated with the given key.
     */
    public String getIndexByKey(Long userId) {
        return layerRepositoryImpl.getIndexByKey(userId);
    }

    /**
     * Retrieves the equipment tile associated with a specific key and tile number.
     *
     * @param key        The key to search for in the database.
     * @param tileNumber The tile number to search for in the database.
     * @param optionnalStartDate The optional start date for tile search
     * @param userId The user id
     * @return The equipment tile as a string, associated with the given key and tile number.
     */
    public String getLayerTile(String key, Long tileNumber, Date optionalStartDate, Long userId) {
        return layerRepositoryImpl.getLayerTile(key, tileNumber, optionalStartDate, userId);
    }
    
    /**
     * Get all Layers. For each layer, get the styles of the layer and the user.
     * @param userId The user id
     * @return A list of LayerDefinitionDto
     */
    public List<LayerWithStylesDto> getLayerDefinitions(Long userId) {
    	List<LayerWithStylesDto> layersDto = new ArrayList<>();
        // Get all layers
    	List<Layer> layers = layerRepository.findAll();
    	for (Layer layer : layers) {
    		LayerWithStylesDto layerWithStylesDto = new LayerWithStylesDto(layer);
            // Get the styles of the layer and the user
    		List<StyleDefinitionDto> layerDefinitionsDto = layerStyleRepository.getLayerStyleByLayerAndUser(layerWithStylesDto.getId(), userId);
            // Build the LayerStyleDetailDto list
            for (StyleDefinitionDto styleDefinitionDto : layerDefinitionsDto) {
                // Get the style definition, if it doesn't exist, throw an exception
    			StyleDefinition styleDefinition = styleDefinitionRepository
                            .findById(styleDefinitionDto.getDefinitionId())
                            .orElseThrow(() -> new TechnicalException("La définition " + styleDefinitionDto.getDefinitionId() + " n'existe pas."));
                // Get the first layer style of the style definition (there is only one for sure)
                LayerStyle layerStyleOfDefinition = styleDefinition.getListOfLayerStyle().get(0);
                // Add the layer style to the list
                layerWithStylesDto.getListStyle().add(new LayerStyleDetailDto(layerStyleOfDefinition));
    		}
            // Add the layer to the list
    		layersDto.add(layerWithStylesDto);
    	}
        // Return the list of layers with their styles
        return layersDto;
    }
    
    public String getAssetByLayerAndIds(List<GetEquipmentsPayload> equipmentsPayload, Long userId) {
    	String assets = "";
        for(GetEquipmentsPayload payload : equipmentsPayload) {
            String res = this.layerRepositoryImpl.getAssetByLayerAndIds(payload.getLyrTableName(), payload.getEquipmentIds(), userId, (payload.allColumn == null ? false : payload.allColumn));
            res = res.substring(1, res.length() - 1);
            if(res.length() > 0) {
            	assets += (assets.length() > 0 ? ",":"")+res;
            }
        }
        assets = "["+assets+"]";
        return assets;
    }

    public Layer getLayerByLyrTableName(String lyrTableName) {
        return this.layerRepository
                .findByLyrTableName(lyrTableName)
                .orElseThrow(() -> new FunctionalException("Le Layer avec la clé  " + lyrTableName + " n'existe pas."));
    }

    public List<VLayerWtrDto> getAllVLayerWtr() {
        return this.layerRepository.getAllVLayerWtr();
    }

    public List<LayerGrpActionDTO> getAllLayerGroups() {
        List<LayerGrpAction> lyrGrpActions = this.layerGrpActionRepository.findAll();

        List<LayerGrpActionDTO> groupedDTOs = lyrGrpActions.stream()
                .collect(Collectors.groupingBy(LayerGrpAction::getGrpId))
                .entrySet()
                .stream()
                .map(entry -> {
                    List<String> lyrTableNames = entry.getValue().stream()
                            .map(item -> item.getLayer().getLyrTableName())
                            .collect(Collectors.toList());

                    String wtrCode = entry.getValue().get(0).getWorkorderTaskReason().getWtrCode();
                    long grpId = entry.getKey();

                    return new LayerGrpActionDTO(grpId, wtrCode, lyrTableNames);
                })
                .collect(Collectors.toList());

        return groupedDTOs;
    }
}
