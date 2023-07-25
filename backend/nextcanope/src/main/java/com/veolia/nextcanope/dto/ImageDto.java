package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.StyleImage;

public class ImageDto {

	private String code;
	
	private String source;

	public ImageDto() {
	}

	public ImageDto(StyleImage styleImage) {
		this.code = styleImage.getSyiCode();
		this.source = styleImage.getSyiSource();
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}
}
