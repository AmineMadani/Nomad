package com.veolia.nextcanope.dto;

public class LayerStyleDto {
	private Long lseId;
	private String lseCode;
	private Long lyrId;

	public LayerStyleDto() {
		// Default constructor
	}

	public LayerStyleDto(Long lseId, String lseCode, Long lyrId) {
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
