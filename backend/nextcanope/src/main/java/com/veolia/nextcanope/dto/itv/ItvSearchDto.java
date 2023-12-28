package com.veolia.nextcanope.dto.itv;

import java.util.Date;

public interface ItvSearchDto {
    Long getId();
    String getItvFilename();
    String getItvStatus();
    Date getItvDcre();
    Boolean getItvStructuralDefect();
    Boolean getItvFunctionalDefect();
    Boolean getItvObservation();
}
