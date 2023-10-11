package com.veolia.nextcanope.dto.payload;

import java.util.List;

public class GetEquipmentsPayload {

    public GetEquipmentsPayload() {}

    public String lyrTableName;

    public List<String> equipmentIds;
    
    public Boolean allColumn;

    public String getLyrTableName() {
        return lyrTableName;
    }

    public void setLyrTableName(String lyrTableName) {
        this.lyrTableName = lyrTableName;
    }

    public List<String> getEquipmentIds() {
        return equipmentIds;
    }

    public void setEquipmentId(List<String> equipmentIds) {
        this.equipmentIds = equipmentIds;
    }

	public Boolean getAllColumn() {
		return allColumn;
	}

	public void setAllColumn(Boolean allColumn) {
		this.allColumn = allColumn;
	}
    
}
