package com.veolia.nextcanope.dto;

public interface WorkorderTaskStatusDto {
    Long getId();
    String getWtsCode();
    String getWtsSlabel();
    String getWtsLlabel();
    Boolean getWtsValid();
}
