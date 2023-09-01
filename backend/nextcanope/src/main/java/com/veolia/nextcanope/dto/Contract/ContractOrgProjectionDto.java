package com.veolia.nextcanope.dto.Contract;

public interface ContractOrgProjectionDto {
    Long getId();
    String getCtrCode();
    String getCtrSlabel();
    String getCtrLlabel();
    Boolean getCtrValid();
    Long getOrgId();
    String getOrgCode();
    String getOrgSlabel();
    String getOrgLlabel();
    String getOutCode();
    Boolean getOrgValid();
    Long getOrgParentId();
    String getOrgParentLlabel();
}
