package com.veolia.nextcanope.dto;

import java.util.Date;

public interface VLayerWtrDto {
    String getAstCode();
    String getAstSlabel();
    String getAstLlabel();
    String getLyrTableName();
    String getWtrSlabel();
    String getWtrLlabel();
    String getWtrCode();
    Long getWtrId();
    Long getAstId();
    Boolean getAswValid();
    Long getAswUcreId();
    Long getAswUmodId();
    Date getAswDcre();
    Date getAswDmod();
}
