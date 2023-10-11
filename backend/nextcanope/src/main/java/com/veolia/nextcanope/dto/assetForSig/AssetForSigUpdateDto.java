package com.veolia.nextcanope.dto.assetForSig;

import com.veolia.nextcanope.model.AssetForSig;
import org.locationtech.jts.geom.Coordinate;

import java.util.ArrayList;
import java.util.List;

public class AssetForSigUpdateDto {
    private Long id;
    private Long lyrId;
    private String afsGeom;
    private String afsInformations;
    private List<List<Double>> coords;

    public AssetForSigUpdateDto() {
        super();
    }

    public AssetForSigUpdateDto(AssetForSig assetForSig) {
        this.id = assetForSig.getAfsCacheId();
        if (assetForSig.getLayer() != null)
            this.lyrId = assetForSig.getLayer().getId();
        this.afsInformations = assetForSig.getAfsInformations();

        if (assetForSig.getAfsGeom() != null && assetForSig.getAfsGeom().getCoordinates() != null) {
            List<List<Double>> coords = new ArrayList<>();
            for (Coordinate coordinate : assetForSig.getAfsGeom().getCoordinates()) {
                List<Double> xy = new ArrayList<>();
                xy.add(coordinate.x);
                xy.add(coordinate.y);
                coords.add(xy);
            }
            this.coords = coords;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLyrId() {
        return lyrId;
    }

    public void setLyrId(Long lyrId) {
        this.lyrId = lyrId;
    }

    public String getAfsGeom() {
        return afsGeom;
    }

    public void setAfsGeom(String afsGeom) {
        this.afsGeom = afsGeom;
    }

    public String getAfsInformations() {
        return afsInformations;
    }

    public void setAfsInformations(String afsInformations) {
        this.afsInformations = afsInformations;
    }

    public List<List<Double>> getCoords() {
        return coords;
    }

    public void setCoords(List<List<Double>> coords) {
        this.coords = coords;
    }
}
