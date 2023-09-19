package com.veolia.nextcanope.dto;

import java.util.Date;
import java.math.BigDecimal;

public interface TaskSearchDto {

    Long getId();

    Long getWkoId();

    String getWkoName();

    Boolean getWkoEmergency();

    Boolean getWkoAppointment();

    Long getCtyId();

    Long getCtrId();

    String getWkoAddress();

    Date getWkoPlanningStartDate();

    Date getWkoPlanningEndDate();

    Date getWkoCompletionStartDate();

    Date getWkoCompletionEndDate();

    Long getWtsId();

    Long getWtrId();

    BigDecimal getLongitude();

    BigDecimal getLatitude();

    Integer getWkoAgentNb();

    String getWkoCreationComment();

    String getAssObjTable();
}
