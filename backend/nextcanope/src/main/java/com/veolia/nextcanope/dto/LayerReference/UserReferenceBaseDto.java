package com.veolia.nextcanope.dto.LayerReference;

public interface UserReferenceBaseDto {
    Integer getReferenceId();
    String getReferenceKey();
    String getAlias();
    String getDisplayType();
    Integer getPosition();
    Boolean getIsVisible();
    String getSection();
}
