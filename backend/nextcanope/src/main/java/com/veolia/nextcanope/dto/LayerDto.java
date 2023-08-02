package com.veolia.nextcanope.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.model.Layer;
/**
 * Dto for Layer Entity
 */
public class LayerDto {
	
    private Long id ;

    @JsonRawValue
    private Integer lyrNumOrder ;

    private Long domId ;

    private String domLLabel;

    private String domCode;

    private Long astId ;

    private String lyrTableName ;

    private String lyrGeomColumnName ;

    private String lyrUuidColumnName ;

    private String lyrGeomSrid ;

    private String lyrSlabel ;

    private String lyrLlabel ;

    private Boolean lyrValid ;

    private Boolean lyrDisplay ;
    
    private List<LayerStyleDetailDto> listStyle = new ArrayList<LayerStyleDetailDto>();

    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Long id ) {
        this.id = id ;
    }
    public Long getId() {
        return this.id;
    }

    public void setLyrNumOrder( Integer lyrNumOrder ) {
        this.lyrNumOrder = lyrNumOrder ;
    }

    public Integer getLyrNumOrder() {
        return this.lyrNumOrder;
    }

    public void setDomId( Long domId ) {
        this.domId = domId ;
    }

    public Long getDomId() {
        return this.domId;
    }

    public String getDomLLabel() {
        return domLLabel;
    }

    public void setDomLLabel(String domLLabel) {
        this.domLLabel = domLLabel;
    }

    public String getDomCode() {
        return domCode;
    }

    public void setDomCode(String domCode) {
        this.domCode = domCode;
    }

    public void setAstId(Long astId ) {
        this.astId = astId ;
    }

    public Long getAstId() {
        return this.astId;
    }

    public void setLyrTableName( String lyrTableName ) {
        this.lyrTableName = lyrTableName ;
    }

    public String getLyrTableName() {
        return this.lyrTableName;
    }

    public void setLyrGeomColumnName( String lyrGeomColumnName ) {
        this.lyrGeomColumnName = lyrGeomColumnName ;
    }

    public String getLyrGeomColumnName() {
        return this.lyrGeomColumnName;
    }

    public void setLyrUuidColumnName( String lyrUuidColumnName ) {
        this.lyrUuidColumnName = lyrUuidColumnName ;
    }

    public String getLyrUuidColumnName() {
        return this.lyrUuidColumnName;
    }

    public void setLyrGeomSrid( String lyrGeomSrid ) {
        this.lyrGeomSrid = lyrGeomSrid ;
    }

    public String getLyrGeomSrid() {
        return this.lyrGeomSrid;
    }

    public void setLyrSlabel( String lyrSlabel ) {
        this.lyrSlabel = lyrSlabel ;
    }

    public String getLyrSlabel() {
        return this.lyrSlabel;
    }

    public void setLyrLlabel( String lyrLlabel ) {
        this.lyrLlabel = lyrLlabel ;
    }

    public String getLyrLlabel() {
        return this.lyrLlabel;
    }

    public void setLyrValid( Boolean lyrValid ) {
        this.lyrValid = lyrValid ;
    }

    public Boolean getLyrValid() {
        return this.lyrValid;
    }

    public void setLyrDisplay( Boolean lyrDisplay ) {
        this.lyrDisplay = lyrDisplay ;
    }

    public Boolean getLyrDisplay() {
        return this.lyrDisplay;
    }
    
	public List<LayerStyleDetailDto> getListStyle() {
		return listStyle;
	}
	
	public void setListStyle(List<LayerStyleDetailDto> listStyle) {
		this.listStyle = listStyle;
	}
	
	public LayerDto(Layer layer) {
		super();
		this.id = layer.getId();
		this.lyrNumOrder = layer.getLyrNumOrder();
		this.domId = layer.getDomains().getId();
        this.domLLabel = layer.getDomains().getDomLlabel();
        this.domCode = layer.getDomains().getDomType();
        if (layer.getAssetType() != null) {
            this.astId = layer.getAssetType().getId();
        }
		this.lyrTableName = layer.getLyrTableName();
		this.lyrGeomColumnName = layer.getLyrGeomColumnName();
		this.lyrUuidColumnName = layer.getLyrUuidColumnName();
		this.lyrGeomSrid = layer.getLyrGeomSrid();
		this.lyrSlabel = layer.getLyrSlabel();
		this.lyrLlabel = layer.getLyrLlabel();
		this.lyrValid = layer.getLyrValid();
		this.lyrDisplay = layer.getLyrDisplay();
	}

}
