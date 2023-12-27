package com.veolia.nextcanope.dto.itv;

import java.util.List;
import java.util.Map;

public class ItvBlockDto {
	
    private Map<String, String> mapB;
    private List<Map<String, String>> listMapC;
    private Integer startLine;
    private String error;
    private String lyrTableName;
    private String itbObjRef;

    public ItvBlockDto() {
    }

    public ItvBlockDto(Map<String, String> mapB, List<Map<String, String>> listMapC) {
        this.mapB = mapB;
        this.listMapC = listMapC;
    }

    public Map<String, String> getMapB() {
        return mapB;
    }

    public void setMapB(Map<String, String> mapB) {
        this.mapB = mapB;
    }

    public List<Map<String, String>> getListMapC() {
        return listMapC;
    }

    public void setListMapC(List<Map<String, String>> listMapC) {
        this.listMapC = listMapC;
    }

    public Integer getStartLine() {
        return startLine;
    }

    public void setStartLine(Integer startLine) {
        this.startLine = startLine;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
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
}
