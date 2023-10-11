package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.ReportQuestion;

public class ReportQuestionDto {
    private Long id;
    private String rqnCode;
    private String rqnSlabel;
    private String rqnLlabel;
    private String rqnType;
    private Boolean rqnRequired;
    private String rqnSelectValues;

    public ReportQuestionDto() {
        super();
    }

    public ReportQuestionDto(ReportQuestion reportQuestion) {
        this.id = reportQuestion.getId();
        this.rqnCode = reportQuestion.getRqnCode();
        this.rqnSlabel = reportQuestion.getRqnSlabel();
        this.rqnLlabel = reportQuestion.getRqnLlabel();
        this.rqnType = reportQuestion.getRqnType();
        this.rqnRequired = reportQuestion.getRqnRequired();
        this.rqnSelectValues = reportQuestion.getRqnSelectValues();
    }

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
