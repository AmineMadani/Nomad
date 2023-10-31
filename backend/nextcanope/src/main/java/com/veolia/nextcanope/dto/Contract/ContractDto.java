package com.veolia.nextcanope.dto.Contract;

import java.util.Date;

public interface ContractDto {
    Long getId();
    String getCtrCode();
    String getCtrSlabel();
    String getCtrLlabel();
    Boolean getCtrValid();
    Date getCtrStartDate();
    Date getCtrEndDate();
}
