package com.veolia.nextcanope.dto.itv;

import java.util.Date;
import java.util.List;

public class SearchItvPayload {
    private List<Long> contractIds;
    private List<Long> cityIds;
    private List<String> status;
    private List<String> defects;
    private Date startDate;
    private Date endDate;

    public List<Long> getContractIds() {
        return contractIds;
    }

    public void setContractIds(List<Long> contractIds) {
        this.contractIds = contractIds;
    }

    public List<Long> getCityIds() {
        return cityIds;
    }

    public void setCityIds(List<Long> cityIds) {
        this.cityIds = cityIds;
    }

    public List<String> getStatus() {
        return status;
    }

    public void setStatus(List<String> status) {
        this.status = status;
    }

    public List<String> getDefects() {
        return defects;
    }

    public void setDefects(List<String> defects) {
        this.defects = defects;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}
