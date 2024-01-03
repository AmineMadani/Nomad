package com.veolia.nextcanope.dto.payload;

import java.util.List;

public class GetEquipmentsPayload {

    public GetEquipmentsPayload() {}

    public String lyrTableName;

    public List<String> assetIds;
    
    public Boolean allColumn;

    public String getLyrTableName() {
        return lyrTableName;
    }

    public void setLyrTableName(String lyrTableName) {
        this.lyrTableName = lyrTableName;
    }

    public List<String> getAssetIds() {
        return assetIds;
    }

    public void setAssetIds(List<String> assetIds) {
        this.assetIds = assetIds;
    }

	public Boolean getAllColumn() {
		return allColumn;
	}

	public void setAllColumn(Boolean allColumn) {
		this.allColumn = allColumn;
	}
    
}
