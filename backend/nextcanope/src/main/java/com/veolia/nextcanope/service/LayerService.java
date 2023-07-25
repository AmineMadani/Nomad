package com.veolia.nextcanope.service;

import java.util.*;

import com.veolia.nextcanope.dto.*;
import com.veolia.nextcanope.dto.payload.UpdateLayerStylePayload;
import com.veolia.nextcanope.enums.LayerReferencesDisplayType;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import jakarta.transaction.Transactional;
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
     * Get all Layers.
     */
    public List<LayerDto> getLayers(Long userId) {
    	List<LayerDto> layersDto = new ArrayList<LayerDto>();
    	List<Layer> layers = layerRepository.findAll();
    	for(Layer layer:layers) {
    		LayerDto layerDto = new LayerDto(layer);
    		List<LayerDefinitionDto> lLayerStyle = layerStyleRepository.getLayerStyleByLayerAndUser(layerDto.getId(), userId);
    		for(LayerDefinitionDto layerStyle: lLayerStyle) {
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

    /**
     * Retrieves a list of LayerStyleDto objects containing a subset of LayerStyle information.
     *
     * @return A List of LayerStyleDto objects representing a subset of LayerStyle entities.
     */
    public List<LayerStyleDto> getAllLayerStyles() {
        List<LayerStyleDto> layerStyleDtos = new ArrayList<>();

        // Retrieve all LayerStyle entities from the database
        List<LayerStyle> layerStyles = layerStyleRepository.findAll();

        // Convert each LayerStyle entity to a LayerStyleDto and add it to the result list
        for (LayerStyle style : layerStyles) {
            layerStyleDtos.add(new LayerStyleDto(style.getId(), style.getLseCode(), style.getLayer().getId()));
        }

        return layerStyleDtos;
    }

    /**
     * Retrieves a list of LayerStyleDto objects containing a subset of LayerStyle information.
     *
     * @return A List of LayerStyleDto objects representing a subset of LayerStyle entities.
     */
    public LayerStyleDetailDto getLayerStyleById(Long layerStyleId) {
        // Retrieve all LayerStyle entities from the database
        Optional<LayerStyle> layerStyle = layerStyleRepository.findById(layerStyleId);

        if (layerStyle.isPresent()) {
            return new LayerStyleDetailDto(layerStyle.get());
        } else {
            throw new FunctionalException("Le style de layer " + layerStyleId + " n'existe pas.");
        }
    }

    /**
     * Save the new layer references configuration of a list of user.
     * It read all userIds and userReferences to create or update a LayerReferencesUser object.
     */
    public void createLayerStyle(LayerStyleDetailDto payload, Long userId) {
        // Create the current user instance
        Users users = new Users();
        users.setId(userId);

        // Create new layer style instance
        LayerStyle layerStyle = new LayerStyle();
        Layer layer = new Layer();
        layer.setId(payload.getLyrId());
        layerStyle.setLayer(layer);
        // Code
        layerStyle.setLseCode(payload.getLseCode());
        layerStyle.setCreatedBy(users);
        layerStyle.setModifiedBy(users);
        // Definitions
        StyleDefinition styleDefinition = new StyleDefinition();
        styleDefinition.setSydCode(payload.getLseCode() + "_DEFAULT");
        styleDefinition.setSydDefinition(payload.getSydDefinition());
        styleDefinition.setCreatedBy(users);
        styleDefinition.setModifiedBy(users);
        // Images
        List<StyleImage> images = new ArrayList<>();
        for (ImageDto image: payload.getListImage()) {
            StyleImage styleImage = createStyleImage(users, image, styleDefinition);
            images.add(styleImage);
        }
        styleDefinition.setListOfStyleImage(images);
        // We set the style definition
        layerStyle.setStyleDefinition(styleDefinition);

        // It saves layer styles in the db
        try {
            this.layerStyleRepository.save(layerStyle);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde des styles de couche.", e.getMessage());
        }
    }

    private StyleImage createStyleImage(Users user, ImageDto image, StyleDefinition styleDefinition) {
        StyleImage imageToAdd = new StyleImage();
        imageToAdd.setStyleDefinition(styleDefinition);
        imageToAdd.setSyiCode(image.getCode());
        imageToAdd.setSyiSource(image.getSource());
        imageToAdd.setCreatedBy(user);
        imageToAdd.setModifiedBy(user);
        return imageToAdd;
    }

    /**
     * Save the new layer references configuration of a list of user.
     * It read all userIds and userReferences to create or update a LayerReferencesUser object.
     */
    public void updateLayerStyle(LayerStyleDetailDto payload, Long userId) {
        // Create the current user instance
        Users users = new Users();
        users.setId(userId);

        // Check if the layer style already exist
        Optional<LayerStyle> optionalLayerStyle = this.layerStyleRepository.findById(payload.getLseId());
        if (optionalLayerStyle.isEmpty()) {
            throw new FunctionalException("Le style de couche " + payload.getLseId() + " n'existe pas.");
        }

        LayerStyle layerStyle = optionalLayerStyle.get();
        // Code
        layerStyle.setLseCode(payload.getLseCode());
        layerStyle.setModifiedBy(users);
        // Definitions
        layerStyle.getStyleDefinition().setSydDefinition(payload.getSydDefinition());
        layerStyle.getStyleDefinition().setModifiedBy(users);
        // Images
        List<StyleImage> images = new ArrayList<>();
        for (ImageDto image: payload.getListImage()) {
            StyleImage imageToSet = layerStyle.getStyleDefinition().getListOfStyleImage()
                    .stream()
                    .filter(img -> img.getSyiCode().equals(image.getCode()))
                    .findFirst().orElse(null);

            if (imageToSet != null) {
                imageToSet.setSyiSource(image.getSource());
                imageToSet.setModifiedBy(users);
                images.add(imageToSet);
            } else {
                StyleImage styleImage = createStyleImage(users, image, layerStyle.getStyleDefinition());
                images.add(styleImage);
            }
        }
        layerStyle.getStyleDefinition().getListOfStyleImage().clear();
        layerStyle.getStyleDefinition().getListOfStyleImage().addAll(images);

        // It saves layer styles in the db
        try {
            this.layerStyleRepository.save(layerStyle);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde des styles de couche.", e.getMessage());
        }
    }

}
