package com.veolia.nextcanope.dto.payload;

import java.util.Date;
import java.util.List;

public class SearchTaskPayload {

    public List<Long> wtsIds;

    public List<Long> wtrIds;

    public List<String> assObjTables;

    public Date wkoPlanningStartDate;

    public Date wkoPlanningEndDate;

    public Boolean wkoAppointment;

    public Boolean wkoEmergency;

    public SearchTaskPayload() {}
}
