package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleSummaryDto;
import com.veolia.nextcanope.dto.LayerStyle.StyleImageDto;
import com.veolia.nextcanope.dto.payload.SaveLayerStylePayload;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.LayerStyleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PatrimonyService is a service class for managing patrimony-related data.
 * It interacts with the PatrimonyRepositoryImpl to access and manipulate the data.
 */
@Service
public class LayerStyleService {
    @Autowired
    private LayerStyleRepository layerStyleRepository;

    /**
     * Retrieves a list of LayerStyleSummaryDto objects based on LayerStyle entities.
     */
    public List<LayerStyleSummaryDto> getAllLayerStyleSummary() {
        List<LayerStyleSummaryDto> layerStyleDtos = new ArrayList<>();

        // Retrieve all LayerStyle entities from the database
        List<LayerStyle> layerStyles = layerStyleRepository.findAll();

        // Convert each LayerStyle entity to a LayerStyleSummaryDto and add it to the result list
        for (LayerStyle style : layerStyles) {
            layerStyleDtos.add(new LayerStyleSummaryDto(style.getId(), style.getLseCode(), style.getLayer().getId()));
        }

        return layerStyleDtos;
    }

    /**
     * Retrieves a LayerStyleDetailDto object based on a LayerStyle entity with the layer style id.
     * If the entity is not found, throw a FunctionalException.
     * @param layerStyleId The id of the LayerStyle entity to retrieve.
     * @return The LayerStyleDetailDto object associated with the given id.
     */
    public LayerStyleDetailDto getLayerStyleDetailById(Long layerStyleId) {
        // Retrieve all LayerStyle entities from the database with the given id
        // If the entity is not found, throw a FunctionalException
        LayerStyle layerStyle = layerStyleRepository
                .findById(layerStyleId)
                .orElseThrow(() -> new FunctionalException("Le style de layer " + layerStyleId + " n'existe pas."));

        return new LayerStyleDetailDto(layerStyle);
    }

    /**
     * Create a new layer style.
     * @param payload The payload containing the layer style data.
     * @param lyrId The id of the layer associated with the layer style.
     * @param userId The id of the user who created the layer style.
     */
    public void createLayerStyle(SaveLayerStylePayload payload, Long lyrId,  Long userId) {
        // Create the current user instance
        Users user = new Users();
        user.setId(userId);

        // Create new layer style instance
        LayerStyle layerStyle = new LayerStyle();
        Layer layer = new Layer();
        layer.setId(lyrId);
        layerStyle.setLayer(layer);

        // Set Code, created by and modified by
        layerStyle.setLseCode(payload.getLseCode());
        layerStyle.setCreatedBy(user);
        layerStyle.setModifiedBy(user);
        // Set definitions
        StyleDefinition styleDefinition = new StyleDefinition();
        styleDefinition.setSydCode(payload.getLseCode() + "_DEFAULT");
        styleDefinition.setSydDefinition(payload.getSydDefinition());
        styleDefinition.setCreatedBy(user);
        styleDefinition.setModifiedBy(user);
        // Set images
        List<StyleImage> images = new ArrayList<>();
        for (StyleImageDto image: payload.getListImage()) {
            StyleImage styleImage = createStyleImage(user, image, styleDefinition);
            images.add(styleImage);
        }
        styleDefinition.setListOfStyleImage(images);

        // Set the style definition of the layer style
        layerStyle.setStyleDefinition(styleDefinition);

        // It saves layer styles in the db
        try {
            this.layerStyleRepository.save(layerStyle);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde des styles de couche.", e.getMessage());
        }
    }

    /**
     * Update a layer style.
     * @param payload The payload containing the layer style data.
     * @param userId The id of the user who updated the layer style.
     */
    public void updateLayerStyle(SaveLayerStylePayload payload, Long lseId, Long userId) {
        // Create the current user instance
        Users user = new Users();
        user.setId(userId);

        // Check if the layer style already exist
        LayerStyle layerStyle = this.layerStyleRepository
                .findById(lseId)
                .orElseThrow(() -> new FunctionalException("Le style de couche " + lseId + " n'existe pas."));

        // Set code, modified by
        layerStyle.setLseCode(payload.getLseCode());
        layerStyle.setModifiedBy(user);
        // Set definition
        layerStyle.getStyleDefinition().setSydDefinition(payload.getSydDefinition());
        layerStyle.getStyleDefinition().setModifiedBy(user);
        // Set images
        // We set mark as deleted the missed images in payload
        List<String> payloadImageCodes = payload.getListImage().stream()
                .map(StyleImageDto::getCode)
                .collect(Collectors.toList());

        for (StyleImage existingImage : layerStyle.getStyleDefinition().getListOfStyleImage()) {
            if (!payloadImageCodes.contains(existingImage.getSyiCode())) {
                existingImage.markAsDeleted(user);
            }
        }
        // We add or set images find in payload
        List<StyleImage> images = new ArrayList<>();
        for (StyleImageDto image: payload.getListImage()) {
            StyleImage imageToSet = layerStyle.getStyleDefinition().getListOfStyleImage()
                    .stream()
                    .filter(img -> img.getSyiCode().equals(image.getCode()))
                    .findFirst().orElse(null);

            if (imageToSet != null) {
                imageToSet.setSyiSource(image.getSource());
                imageToSet.setModifiedBy(user);
                images.add(imageToSet);
            } else {
                StyleImage styleImage = createStyleImage(user, image, layerStyle.getStyleDefinition());
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

    /**
     * Delete a layer style. It's only a logical deletion. The ddel date is set to the current date.
     */
    public void deleteLayerStyle(Long lseId, Long userId) {
        // Create the current user instance
        Users user = new Users();
        user.setId(userId);

        // Check if the layer style already exist
        LayerStyle layerStyle = this.layerStyleRepository
                .findById(lseId)
                .orElseThrow(() -> new FunctionalException("Le style de couche " + lseId + " n'existe pas."));

        // Mark layer styles and children as deleted
        layerStyle.markAsDeleted(user);
        layerStyle.getStyleDefinition().markAsDeleted(user);
        layerStyle.getStyleDefinition().getListOfStyleImage().forEach(image -> image.markAsDeleted(user));

        // It saves layer styles in the db
        try {
            this.layerStyleRepository.save(layerStyle);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la suppression des styles de couche.", e.getMessage());
        }
    }

    /**
     * Create a new StyleImage instance.
     * @param user The user who created the style image.
     * @param image The image data.
     * @param styleDefinition The style definition to which the image belongs.
     * @return The created StyleImage instance.
     */
    private StyleImage createStyleImage(Users user, StyleImageDto image, StyleDefinition styleDefinition) {
        StyleImage imageToAdd = new StyleImage();
        imageToAdd.setStyleDefinition(styleDefinition);
        imageToAdd.setSyiCode(image.getCode());
        imageToAdd.setSyiSource(image.getSource());
        imageToAdd.setCreatedBy(user);
        imageToAdd.setModifiedBy(user);
        return imageToAdd;
    }
}
