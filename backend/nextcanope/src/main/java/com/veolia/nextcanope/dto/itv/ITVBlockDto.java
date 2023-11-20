package com.veolia.nextcanope.dto.itv;

import java.util.List;
import java.util.Map;

public class ITVBlockDto {
    private Map<String, String> mapB;
    private List<Map<String, String>> listMapC;

    public ITVBlockDto(Map<String, String> mapB, List<Map<String, String>> listMapC) {
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
}
