package com.veolia.nextcanope.dto;

import java.util.Date;
import java.util.List;

public class ReportDto {
	
	private Date dateCompletion;
	
	private List<ReportValueDto> reportValues;

	public Date getDateCompletion() {
		return dateCompletion;
	}

	public void setDateCompletion(Date dateCompletion) {
		this.dateCompletion = dateCompletion;
	}

	public List<ReportValueDto> getReportValues() {
		return reportValues;
	}

	public void setReportValues(List<ReportValueDto> reportValues) {
		this.reportValues = reportValues;
	}

	public ReportDto() {
		super();
	}

}
