package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.OrganizationalUnit;

public class OrganizationalUnitDto {
    private Long id;
    private String orgCode;
    private String orgSlabel;
    private String orgLlabel;
    private String outCode;
    private Boolean orgValid;

    public OrganizationalUnitDto(OrganizationalUnit organizationalUnit) {
        this.id = organizationalUnit.getId();
        this.orgCode = organizationalUnit.getOrgCode();
        this.orgSlabel = organizationalUnit.getOrgSlabel();
        this.orgLlabel = organizationalUnit.getOrgLlabel();
        this.outCode = organizationalUnit.getOrganizationalUnitType().getOutCode();
        this.orgValid = organizationalUnit.getOrgValid();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOrgCode() {
        return orgCode;
    }

    public void setOrgCode(String orgCode) {
        this.orgCode = orgCode;
    }

    public String getOrgSlabel() {
        return orgSlabel;
    }

    public void setOrgSlabel(String orgSlabel) {
        this.orgSlabel = orgSlabel;
    }

    public String getOrgLlabel() {
        return orgLlabel;
    }

    public void setOrgLlabel(String orgLlabel) {
        this.orgLlabel = orgLlabel;
    }

    public String getOutCode() {
        return outCode;
    }

    public void setOutCode(String outCode) {
        this.outCode = outCode;
    }

    public Boolean getOrgValid() {
        return orgValid;
    }

    public void setOrgValid(Boolean orgValid) {
        this.orgValid = orgValid;
    }
}
