package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.veolia.nextcanope.model.Report;
import com.veolia.nextcanope.model.Task;

public class TaskDto {

    private Long id;

    private String assObjRef;

    private String assObjTable;

    private Long wtsId;

    private Long wtrId;
    
    private Long ctrId;
    
    private BigDecimal longitude;
    
    private BigDecimal latitude;
    
    private Date tskReportDate;
    
    private ReportDto report;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getWtsId() {
        return wtsId;
    }

    public void setWtsId(Long wtsId) {
        this.wtsId = wtsId;
    }
    
    public Long getWtrId() {
		return wtrId;
	}

    public void setWtrId(Long wtrId) {
        this.wtrId = wtrId;
    }

    public Long getCtrId() {
		return ctrId;
	}

	public void setCtrId(Long ctrId) {
		this.ctrId = ctrId;
	}

	public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

	public String getAssObjRef() {
		return assObjRef;
	}

	public void setAssObjRef(String assObjRef) {
		this.assObjRef = assObjRef;
	}

	public String getAssObjTable() {
		return assObjTable;
	}

	public void setAssObjTable(String assObjTable) {
		this.assObjTable = assObjTable;
	}

	public Date getTskReportDate() {
		return tskReportDate;
	}

	public void setTskReportDate(Date tskReportDate) {
		this.tskReportDate = tskReportDate;
	}

	public ReportDto getReport() {
		return report;
	}

	public void setReport(ReportDto report) {
		this.report = report;
	}

	public TaskDto() {
		super();
	}

	public TaskDto(Task task) {
        super();
        this.id = task.getId();
        this.longitude = task.getLongitude();
        this.latitude = task.getLatitude();
        this.wtsId = task.getWorkorderTaskStatus().getId();
        this.assObjRef = task.getAsset().getAssObjRef();
        this.tskReportDate = task.getTskReportDate();
        this.assObjTable = task.getAsset().getLayer().getLyrTableName();
        this.wtrId = task.getWorkorderTaskReason().getId();
        this.ctrId = task.getContract().getId();
        this.report = new ReportDto();
        this.report.setDateCompletion(task.getTskReportDate());
        
        if(task.getListOfReport().size() > 0) {
        	List<ReportValueDto> reportValues = new ArrayList<ReportValueDto>();
        	for(Report report: task.getListOfReport()) {
        		ReportValueDto reportValue = new ReportValueDto();
        		reportValue.setKey(report.getRptKey());
        		reportValue.setAnswer(report.getRptValue());
        		reportValue.setQuestion(report.getRptLabel());
        		reportValues.add(reportValue);
        	}
        	this.report.setReportValues(reportValues);
        }
    }
}
