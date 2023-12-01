package com.veolia.nextcanope.dto.Contract;

import java.util.Date;

public interface ContractOrgProjectionDto {
    Long getId();
    String getCtrCode();
    String getCtrSlabel();
    String getCtrLlabel();
    Boolean getCtrValid();
    Boolean getCtrExpired();
    Date getCtrEndDate();
    Long getOrgId();
    String getOrgCode();
    String getOrgSlabel();
    String getOrgLlabel();
    String getOutCode();
    Boolean getOrgValid();
    Long getOrgParentId();
    String getOrgParentLlabel();
}
