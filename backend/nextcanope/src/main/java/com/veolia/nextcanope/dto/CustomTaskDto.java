package com.veolia.nextcanope.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.veolia.nextcanope.model.Task;

public class CustomTaskDto {

    private Long id;

    private String assObjRef;

    private String assObjTable;

    private Long wtsId;
    
    private BigDecimal longitude;
    
    private BigDecimal latitude;
    
    private Date tskCompletionDate;

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

	public Date getTskCompletionDate() {
		return tskCompletionDate;
	}

	public void setTskCompletionDate(Date tskCompletionDate) {
		this.tskCompletionDate = tskCompletionDate;
	}

	public CustomTaskDto() {
		super();
	}

	public CustomTaskDto(Task task) {
        super();
        this.id = task.getId();
        this.longitude = task.getLongitude();
        this.latitude = task.getLatitude();
        this.wtsId = task.getWorkorderTaskStatus().getId();
        this.assObjRef = task.getAsset().getAssObjRef();
        this.assObjTable = task.getAsset().getAssObjTable();
        this.tskCompletionDate = task.getTskCompletionDate();
    }
}
