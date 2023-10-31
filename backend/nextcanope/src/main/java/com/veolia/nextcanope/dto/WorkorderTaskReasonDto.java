package com.veolia.nextcanope.dto;

public interface WorkorderTaskReasonDto {
    Long getId();
    String getWtrCode();
    String getWtrSlabel();
    String getWtrLlabel();
    Boolean getWtrValid();
    Boolean getWtrNoXy();
}
