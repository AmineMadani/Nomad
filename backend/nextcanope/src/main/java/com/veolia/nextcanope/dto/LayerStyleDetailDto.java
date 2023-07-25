package com.veolia.nextcanope.dto;

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

	private List<ImageDto> listImage = new ArrayList<ImageDto>();

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
			this.listImage.add(new ImageDto(styleImage));
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

	public List<ImageDto> getListImage() {
		return listImage;
	}

	public void setListImage(List<ImageDto> listImage) {
		this.listImage = listImage;
	}

	public Long getSydId() {
		return sydId;
	}

	public void setSydId(Long sydId) {
		this.sydId = sydId;
	}
}
