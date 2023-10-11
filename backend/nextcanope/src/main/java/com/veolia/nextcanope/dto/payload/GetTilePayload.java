package com.veolia.nextcanope.dto.payload;

import java.util.Date;

public class GetTilePayload {

    public GetTilePayload() {}

    public Date startDate;

	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}
     
}
