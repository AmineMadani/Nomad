package com.veolia.nextcanope.dto.LayerStyle;

import com.veolia.nextcanope.model.LayerStyle;
import com.veolia.nextcanope.model.StyleImage;

import java.util.ArrayList;
import java.util.List;

public class LayerStyleDetailDto {
	private Long lyrId;
	private String lyrTableName;

	private Long lseId;
	private String lseCode;

	private Long sydId;
	private String sydDefinition;

	private List<StyleImageDto> listImage = new ArrayList<StyleImageDto>();

	public LayerStyleDetailDto() {
	}

	public LayerStyleDetailDto(LayerStyle layerStyle) {
		this.lyrId = layerStyle.getLayer().getId();
		this.lyrTableName = layerStyle.getLayer().getLyrTableName();
		this.lseId = layerStyle.getId();
		this.lseCode = layerStyle.getLseCode();
		this.sydId = layerStyle.getStyleDefinition().getId();
		this.sydDefinition = layerStyle.getStyleDefinition().getSydDefinition();
		for(StyleImage styleImage: layerStyle.getStyleDefinition().getListOfStyleImage()) {
			this.listImage.add(new StyleImageDto(styleImage));
		}
	}

	public Long getLseId() {
		return lseId;
	}

	public void setLseId(Long lseId) {
		this.lseId = lseId;
	}

	public String getLseCode() {
		return lseCode;
	}

	public void setLseCode(String lseCode) {
		this.lseCode = lseCode;
	}

	public Long getLyrId() {
		return lyrId;
	}

	public void setLyrId(Long lyrId) {
		this.lyrId = lyrId;
	}

	public String getLyrTableName() {
		return lyrTableName;
	}

	public void setLyrTableName(String lyrTableName) {
		this.lyrTableName = lyrTableName;
	}

	public String getSydDefinition() {
		return sydDefinition;
	}

	public void setSydDefinition(String sydDefinition) {
		this.sydDefinition = sydDefinition;
	}

	public List<StyleImageDto> getListImage() {
		return listImage;
	}

	public void setListImage(List<StyleImageDto> listImage) {
		this.listImage = listImage;
	}

	public Long getSydId() {
		return sydId;
	}

	public void setSydId(Long sydId) {
		this.sydId = sydId;
	}
}
