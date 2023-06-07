package com.veolia.nextcanope.dto;

public class UserContextDto {
	
    private String userPreferences;
    
    private double lng;
    
    private double lat;
    
    private int zoom;

	public String getUserPreferences() {
		return userPreferences;
	}

	public void setUserPreferences(String userPreferences) {
		this.userPreferences = userPreferences;
	}

	public double getLng() {
		return lng;
	}

	public void setLng(double lng) {
		this.lng = lng;
	}

	public double getLat() {
		return lat;
	}

	public void setLat(double lat) {
		this.lat = lat;
	}

	public int getZoom() {
		return zoom;
	}

	public void setZoom(int zoom) {
		this.zoom = zoom;
	}

}
