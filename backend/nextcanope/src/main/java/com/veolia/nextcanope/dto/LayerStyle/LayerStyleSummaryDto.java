package com.veolia.nextcanope.dto.LayerStyle;

public class LayerStyleSummaryDto {
	private Long lseId;
	private String lseCode;
	private Long lyrId;

	public LayerStyleSummaryDto() {
		// Default constructor
	}

	public LayerStyleSummaryDto(Long lseId, String lseCode, Long lyrId) {
		this.lseId = lseId;
		this.lseCode = lseCode;
		this.lyrId = lyrId;
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
}
