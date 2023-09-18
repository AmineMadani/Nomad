package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.assetForSig.AssetForSigUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.AssetForSigRepository;
import com.veolia.nextcanope.repository.LayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AssetForSigService {
    @Autowired
    AssetForSigRepository assetForSigRepository;

    @Autowired
    UserService userService;

    @Autowired
    LayerRepository layerRepository;

    /**
     *
     * @param assetForSigUpdateDto The asset to create
     * @param userId the user id who create the form
     * @return The form
     */
    public Long createAssetForSig(AssetForSigUpdateDto assetForSigUpdateDto, Long userId) {
        Users user = userService.getUserById(userId);

        Layer layer = layerRepository.findById(assetForSigUpdateDto.getLyrId()).orElse(null);
        if (layer == null)
            throw new FunctionalException("Layer non trouvée : " + assetForSigUpdateDto.getLyrId());

        AssetForSig assetForSig = new AssetForSig();
        assetForSig.setAfsGeom(assetForSigUpdateDto.getAfsGeom());
        assetForSig.setAfsInformations(assetForSigUpdateDto.getAfsInformations());
        assetForSig.setCreatedBy(user);
        assetForSig.setModifiedBy(user);
        assetForSig.setLayer(layer);

        try {
            assetForSig = assetForSigRepository.save(assetForSig);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde de l'asset pour SIG pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return assetForSig.getId();
    }
}
