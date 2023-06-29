package com.veolia.nextcanope.dto;

import java.util.ArrayList;
import java.util.List;

import com.veolia.nextcanope.model.StyleDefinition;
import com.veolia.nextcanope.model.StyleImage;

public class StyleDto {

	private String code;
	
	private String definition;
	
	private List<ImageDto> listImage = new ArrayList<ImageDto>();

	public StyleDto(StyleDefinition styleDefinition) {
		this.code = styleDefinition.getSydCode();
		this.definition = styleDefinition.getSydDefinition();
		for(StyleImage styleImage: styleDefinition.getListOfStyleImage()) {
			this.listImage.add(new ImageDto(styleImage));
		}
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getDefinition() {
		return definition;
	}

	public void setDefinition(String definition) {
		this.definition = definition;
	}

	public List<ImageDto> getListImage() {
		return listImage;
	}

	public void setListImage(List<ImageDto> listImage) {
		this.listImage = listImage;
	}
	
}
