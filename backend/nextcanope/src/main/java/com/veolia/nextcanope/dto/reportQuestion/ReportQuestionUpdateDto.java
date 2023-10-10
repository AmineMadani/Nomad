package com.veolia.nextcanope.dto.reportQuestion;

public class ReportQuestionUpdateDto {
    private Long id;
    private String rqnCode;
    private String rqnSlabel;
    private String rqnLlabel;
    private String rqnType;
    private Boolean rqnRequired;
    private String rqnSelectValues;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRqnCode() {
        return rqnCode;
    }

    public void setRqnCode(String rqnCode) {
        this.rqnCode = rqnCode;
    }

    public String getRqnSlabel() {
        return rqnSlabel;
    }

    public void setRqnSlabel(String rqnSlabel) {
        this.rqnSlabel = rqnSlabel;
    }

    public String getRqnLlabel() {
        return rqnLlabel;
    }

    public void setRqnLlabel(String rqnLlabel) {
        this.rqnLlabel = rqnLlabel;
    }

    public String getRqnType() {
        return rqnType;
    }

    public void setRqnType(String rqnType) {
        this.rqnType = rqnType;
    }

    public Boolean getRqnRequired() {
        return rqnRequired;
    }

    public void setRqnRequired(Boolean rqnRequired) {
        this.rqnRequired = rqnRequired;
    }

    public String getRqnSelectValues() {
        return rqnSelectValues;
    }

    public void setRqnSelectValues(String rqnSelectValues) {
        this.rqnSelectValues = rqnSelectValues;
    }
}
