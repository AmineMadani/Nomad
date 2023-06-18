package com.veolia.nextcanope.dto.LayerTree;

public interface LayerTreeFlatDto {
    String getId();
    String getParentDomainAlias();
    String getParentTreeGroup();
    String getTreeGroup();
    Integer getTreeGroupId();
    Integer getLyrNumOrder();
    Integer getDomId();
    Integer getAstId();
    String getLyrTableName();
    String getLyrSlabel();
    Boolean getLyrDisplay();
    Boolean getLyrValid();
    String getLyrStyle();
}
