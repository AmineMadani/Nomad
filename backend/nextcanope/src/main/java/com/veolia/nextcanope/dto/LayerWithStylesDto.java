package com.veolia.nextcanope.dto;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.model.Layer;

public class LayerWithStylesDto extends LayerDto {
    private List<LayerStyleDetailDto> listStyle = new ArrayList<>();
    
	public List<LayerStyleDetailDto> getListStyle() {
		return listStyle;
	}
	
	public void setListStyle(List<LayerStyleDetailDto> listStyle) {
		this.listStyle = listStyle;
	}
	
	public LayerWithStylesDto(Layer layer) {
		super(layer);
	}
}
