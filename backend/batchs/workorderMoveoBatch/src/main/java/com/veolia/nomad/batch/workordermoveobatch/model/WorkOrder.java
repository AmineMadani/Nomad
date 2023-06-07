package com.veolia.nomad.batch.workordermoveobatch.model;

public class WorkOrder {
	
	private String lyrTableName;

	public String getLyrTableName() {
		return lyrTableName;
	}

	public void setLyrTableName(String lyrTableName) {
		this.lyrTableName = lyrTableName;
	}

	public WorkOrder(String lyrTableName) {
		super();
		this.lyrTableName = lyrTableName;
	}

	public WorkOrder() {
		super();
	}
	
}
