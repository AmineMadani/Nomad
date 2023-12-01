package com.veolia.nextcanope.dto.Contract;

import com.veolia.nextcanope.dto.OrganizationalUnitDto;

import java.util.ArrayList;
import java.util.List;

public class ContractOrgDto {
    private Long id;
    private String ctrCode;
    private String ctrSlabel;
    private String ctrLlabel;
    private Boolean ctrValid;
    private Boolean ctrExpired;


    private List<OrganizationalUnitDto> organizationalUnits;

    public ContractOrgDto(ContractOrgProjectionDto projection) {
        this.id = projection.getId();
        this.ctrCode = projection.getCtrCode();
        this.ctrSlabel = projection.getCtrSlabel();
        this.ctrLlabel = projection.getCtrLlabel();
        this.ctrValid = projection.getCtrValid();
        this.ctrExpired = projection.getCtrExpired();
        this.organizationalUnits = new ArrayList<>(); // Initialize as empty list. It will be filled later.
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCtrCode() {
        return ctrCode;
    }

    public void setCtrCode(String ctrCode) {
        this.ctrCode = ctrCode;
    }

    public String getCtrSlabel() {
        return ctrSlabel;
    }

    public void setCtrSlabel(String ctrSlabel) {
        this.ctrSlabel = ctrSlabel;
    }

    public String getCtrLlabel() {
        return ctrLlabel;
    }

    public void setCtrLlabel(String ctrLlabel) {
        this.ctrLlabel = ctrLlabel;
    }


    public Boolean getCtrValid() {
        return ctrValid;
    }

    public void setCtrValid(Boolean ctrValid) {
        this.ctrValid = ctrValid;
    }

    public Boolean getCtrExpired() {
        return ctrExpired;
    }

    public void setCtrExpired(Boolean ctrExpired) {
        this.ctrExpired = ctrExpired;
    }

    public List<OrganizationalUnitDto> getOrganizationalUnits() {
        return organizationalUnits;
    }

    public void setOrganizationalUnits(List<OrganizationalUnitDto> organizationalUnits) {
        this.organizationalUnits = organizationalUnits;
    }
}
