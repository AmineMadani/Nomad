package com.veolia.nextcanope.dto.assetForSig;

import java.util.List;

public class AssetForSigUpdateDto {
    private Long id;
    private Long lyrId;
    private String afsGeom;
    private String afsInformations;

    private List<List<Double>> coords;

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
