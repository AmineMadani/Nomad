package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.Permissions;
import com.veolia.nextcanope.model.PrfPer;

import java.util.List;

public class PermissionDto {
    private Long id;
    private String perCode;
    private String perSlabel;
    private String perLlabel;
    private Boolean perValid;
    private String perCategory;
    private List<String> profilesCodes;

    public PermissionDto(Permissions permission) {
        this.id = permission.getId();
        this.perCode = permission.getPerCode();
        this.perSlabel = permission.getPerSlabel();
        this.perLlabel = permission.getPerLlabel();
        this.perValid = permission.getPerValid();
        this.perCategory = permission.getPerCategory();
        this.profilesCodes = permission.getListOfPrfPer()
                .stream()
                .map((PrfPer prfPer) -> prfPer.getProfile().getPrfCode())
                .toList();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPerCode() {
        return perCode;
    }

    public void setPerCode(String perCode) {
        this.perCode = perCode;
    }

    public String getPerSlabel() {
        return perSlabel;
    }

    public void setPerSlabel(String perSlabel) {
        this.perSlabel = perSlabel;
    }

    public String getPerLlabel() {
        return perLlabel;
    }

    public void setPerLlabel(String perLlabel) {
        this.perLlabel = perLlabel;
    }


    public Boolean getPerValid() {
        return perValid;
    }

    public void setPerValid(Boolean perValid) {
        this.perValid = perValid;
    }

    public String getPerCategory() {
        return perCategory;
    }

    public void setPerCategory(String perCategory) {
        this.perCategory = perCategory;
    }

    public List<String> getProfilesCodes() {
        return profilesCodes;
    }

    public void setProfilesCodes(List<String> profilesCodes) {
        this.profilesCodes = profilesCodes;
    }
}
