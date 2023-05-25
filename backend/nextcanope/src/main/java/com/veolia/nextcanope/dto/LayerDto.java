package com.veolia.nextcanope.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.veolia.nextcanope.model.Layer;

import java.util.Date;
/**
 * Dto for Layer Entity
 */
public class LayerDto {
    private Long id ;

    @JsonRawValue
    private Integer lyrNumOrder ;

    private Long domId ;

    private Long astId ;

    private Long treGroupId ;

    private Long treSimplifiedGroupId ;

    private String lyrTableName ;

    private String lyrGeomColumnName ;

    private String lyrUuidColumnName ;

    private String lyrGeomSrid ;

    private String lyrStyle ;

    private String lyrSlabel ;

    private String lyrLlabel ;

    private Boolean lyrValid ;

    private Boolean lyrDisplay ;

    private Long lyrUcreId ;

    private Long lyrUmodId ;

    private Date lyrDcre ;

    private Date lyrDmod ;



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

    public void setAstId( Long astId ) {
        this.astId = astId ;
    }

    public Long getAstId() {
        return this.astId;
    }

    public void setTreGroupId( Long treGroupId ) {
        this.treGroupId = treGroupId ;
    }

    public Long getTreGroupId() {
        return this.treGroupId;
    }

    public void setTreSimplifiedGroupId( Long treSimplifiedGroupId ) {
        this.treSimplifiedGroupId = treSimplifiedGroupId ;
    }

    public Long getTreSimplifiedGroupId() {
        return this.treSimplifiedGroupId;
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

    public void setLyrStyle( String lyrStyle ) {
        this.lyrStyle = lyrStyle ;
    }

    public String getLyrStyle() {
        return this.lyrStyle;
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

    public void setLyrUcreId( Long lyrUcreId ) {
        this.lyrUcreId = lyrUcreId ;
    }

    public Long getLyrUcreId() {
        return this.lyrUcreId;
    }

    public void setLyrUmodId( Long lyrUmodId ) {
        this.lyrUmodId = lyrUmodId ;
    }

    public Long getLyrUmodId() {
        return this.lyrUmodId;
    }

    public void setLyrDcre( Date lyrDcre ) {
        this.lyrDcre = lyrDcre ;
    }

    public Date getLyrDcre() {
        return this.lyrDcre;
    }

    public void setLyrDmod( Date lyrDmod ) {
        this.lyrDmod = lyrDmod ;
    }

    public Date getLyrDmod() {
        return this.lyrDmod;
    }
    
	public LayerDto(Layer layer) {
		super();
		this.id = layer.getId();
		this.lyrNumOrder = layer.getLyrNumOrder();
		this.domId = layer.getDomId();
		this.astId = layer.getAstId();
		this.treGroupId = layer.getTreGroupId();
		this.treSimplifiedGroupId = layer.getTreSimplifiedGroupId();
		this.lyrTableName = layer.getLyrTableName();
		this.lyrGeomColumnName = layer.getLyrGeomColumnName();
		this.lyrUuidColumnName = layer.getLyrUuidColumnName();
		this.lyrGeomSrid = layer.getLyrGeomSrid();
		this.lyrStyle = layer.getLyrStyle();
		this.lyrSlabel = layer.getLyrSlabel();
		this.lyrLlabel = layer.getLyrLlabel();
		this.lyrValid = layer.getLyrValid();
		this.lyrDisplay = layer.getLyrDisplay();
		this.lyrUcreId = layer.getLyrUcreId();
		this.lyrUmodId = layer.getLyrUmodId();
		this.lyrDcre = layer.getLyrDcre();
		this.lyrDmod = layer.getLyrDmod();
	}

}
