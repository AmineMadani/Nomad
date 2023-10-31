package com.veolia.nextcanope.dto.LayerReference;

public interface LayerReferencesFlatDto {
    String getLayer();
    Long getReferenceId();
    String getReferenceKey();
    String getAlias();
    String getDisplayType();
    Integer getPosition();
    Boolean getIsVisible();
    String getSection();
    Boolean getValid();
}
