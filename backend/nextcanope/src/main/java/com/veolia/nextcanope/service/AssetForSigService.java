package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.assetForSig.AssetForSigUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.AssetForSigRepository;
import com.veolia.nextcanope.repository.LayerRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.CoordinateXY;
import org.locationtech.jts.geom.Geometry;
import org.locationtech.jts.geom.GeometryFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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

        if (assetForSigUpdateDto.getCoords().size() == 1) {
            // POINT
            List<Double> xy = assetForSigUpdateDto.getCoords().get(0);
            Coordinate coordinate = new CoordinateXY(xy.get(0), xy.get(1));
            Geometry geometry = new GeometryFactory().createPoint(coordinate);
            assetForSig.setAfsGeom(geometry);
        } else if (assetForSigUpdateDto.getCoords().size() > 1){
            // LINE
            List<Coordinate> coordinates = new ArrayList<>();
            for (List<Double> xy : assetForSigUpdateDto.getCoords()) {
                Coordinate coordinate = new CoordinateXY(xy.get(0), xy.get(1));
                coordinates.add(coordinate);
            }
            Geometry geometry = new GeometryFactory().createLineString(coordinates.toArray(new Coordinate[0]));
            assetForSig.setAfsGeom(geometry);
        } else {
            throw new FunctionalException("Création impossible du nouvel équipement : pas de coordonnées");
        }

        assetForSig.setAfsInformations(assetForSigUpdateDto.getAfsInformations());
        assetForSig.setAfsCacheId(assetForSigUpdateDto.getId());
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
