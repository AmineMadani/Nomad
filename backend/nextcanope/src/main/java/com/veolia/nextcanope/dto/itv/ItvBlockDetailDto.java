package com.veolia.nextcanope.dto.itv;

import java.util.List;

public class ItvBlockDetailDto {
    private Long id;
    private String lyrTableName;
    private String itbObjRef;
    private Boolean itbStructuralDefect;
    private Boolean itbFunctionalDefect;
    private Boolean itbObservation;
    private String address;
    private String city;
    private String startNodeId;
    private String endNodeId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLyrTableName() {
        return lyrTableName;
    }

    public void setLyrTableName(String lyrTableName) {
        this.lyrTableName = lyrTableName;
    }

    public String getItbObjRef() {
        return itbObjRef;
    }

    public void setItbObjRef(String itbObjRef) {
        this.itbObjRef = itbObjRef;
    }

    public Boolean getItbStructuralDefect() {
        return itbStructuralDefect;
    }

    public void setItbStructuralDefect(Boolean itbStructuralDefect) {
        this.itbStructuralDefect = itbStructuralDefect;
    }

    public Boolean getItbFunctionalDefect() {
        return itbFunctionalDefect;
    }

    public void setItbFunctionalDefect(Boolean itbFunctionalDefect) {
        this.itbFunctionalDefect = itbFunctionalDefect;
    }

    public Boolean getItbObservation() {
        return itbObservation;
    }

    public void setItbObservation(Boolean itbObservation) {
        this.itbObservation = itbObservation;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStartNodeId() {
        return startNodeId;
    }

    public void setStartNodeId(String startNodeId) {
        this.startNodeId = startNodeId;
    }

    public String getEndNodeId() {
        return endNodeId;
    }

    public void setEndNodeId(String endNodeId) {
        this.endNodeId = endNodeId;
    }
}
