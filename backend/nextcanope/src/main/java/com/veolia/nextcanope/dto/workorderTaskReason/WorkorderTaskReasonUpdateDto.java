package com.veolia.nextcanope.dto.workorderTaskReason;

import java.util.List;

public class WorkorderTaskReasonUpdateDto {
    private Long id;
    private String wtrCode;
    private String wtrSlabel;
    private String wtrLlabel;
    private boolean wtrNoXy;
    private List<Long> listAstId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWtrCode() {
        return wtrCode;
    }

    public void setWtrCode(String wtrCode) {
        this.wtrCode = wtrCode;
    }

    public String getWtrSlabel() {
        return wtrSlabel;
    }

    public void setWtrSlabel(String wtrSlabel) {
        this.wtrSlabel = wtrSlabel;
    }

    public String getWtrLlabel() {
        return wtrLlabel;
    }

    public void setWtrLlabel(String wtrLlabel) {
        this.wtrLlabel = wtrLlabel;
    }

    public boolean isWtrNoXy() {
        return wtrNoXy;
    }

    public void setWtrNoXy(boolean wtrNoXy) {
        this.wtrNoXy = wtrNoXy;
    }

    public List<Long> getListAstId() {
        return listAstId;
    }

    public void setListAstId(List<Long> listAstId) {
        this.listAstId = listAstId;
    }
}
