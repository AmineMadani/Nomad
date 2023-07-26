package com.veolia.nextcanope.dto.LayerStyle;

import com.veolia.nextcanope.model.StyleImage;

public class StyleImageDto {

	private String code;
	
	private String source;

	public StyleImageDto() {
	}

	public StyleImageDto(StyleImage styleImage) {
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
