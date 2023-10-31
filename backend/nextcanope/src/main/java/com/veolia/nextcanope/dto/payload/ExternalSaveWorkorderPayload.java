package com.veolia.nextcanope.dto.payload;

import java.util.Date;

public class ExternalSaveWorkorderPayload {
    private Long id;
    private Date completionStartDate;
    private Date completionEndDate;
    private String agent;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getCompletionStartDate() {
        return completionStartDate;
    }

    public void setCompletionStartDate(Date completionStartDate) {
        this.completionStartDate = completionStartDate;
    }

    public Date getCompletionEndDate() {
        return completionEndDate;
    }

    public void setCompletionEndDate(Date completionEndDate) {
        this.completionEndDate = completionEndDate;
    }

    public String getAgent() {
        return agent;
    }

    public void setAgent(String agent) {
        this.agent = agent;
    }
}
