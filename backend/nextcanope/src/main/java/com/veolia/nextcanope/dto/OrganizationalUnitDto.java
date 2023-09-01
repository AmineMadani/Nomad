package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.dto.Contract.ContractOrgProjectionDto;
import com.veolia.nextcanope.model.OrganizationalUnit;

public class OrganizationalUnitDto {
    private Long id;
    private String orgCode;
    private String orgSlabel;
    private String orgLlabel;
    private String outCode;
    private Boolean orgValid;
    private Long orgParentId;
    private String orgParentLlabel;

    public OrganizationalUnitDto(OrganizationalUnit organizationalUnit) {
        this.id = organizationalUnit.getId();
        this.orgCode = organizationalUnit.getOrgCode();
        this.orgSlabel = organizationalUnit.getOrgSlabel();
        this.orgLlabel = organizationalUnit.getOrgLlabel();
        this.outCode = organizationalUnit.getOrganizationalUnitType().getOutCode();
        this.orgValid = organizationalUnit.getOrgValid();
        if (organizationalUnit.getOrganizationalUnitParent() != null) {
            this.orgParentId = organizationalUnit.getOrganizationalUnitParent().getId();
            this.orgParentLlabel = organizationalUnit.getOrganizationalUnitParent().getOrgLlabel();
        }
    }

    public OrganizationalUnitDto(ContractOrgProjectionDto projection) {
        this.id = projection.getOrgId();
        this.orgCode = projection.getOrgCode();
        this.orgSlabel = projection.getOrgSlabel();
        this.orgLlabel = projection.getOrgLlabel();
        this.orgValid = projection.getOrgValid();
        this.outCode = projection.getOutCode();
        this.orgParentId = projection.getOrgParentId();
        this.orgParentLlabel = projection.getOrgParentLlabel();
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

    public Long getOrgParentId() {
        return orgParentId;
    }

    public void setOrgParentId(Long orgParentId) {
        this.orgParentId = orgParentId;
    }

    public String getOrgParentLlabel() {
        return orgParentLlabel;
    }

    public void setOrgParentLlabel(String orgParentLlabel) {
        this.orgParentLlabel = orgParentLlabel;
    }
}
