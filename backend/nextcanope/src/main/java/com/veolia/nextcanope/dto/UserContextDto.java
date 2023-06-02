package com.veolia.nextcanope.dto;

public class UserContextDto {
    private String userPreferences;

    public  String getUserPreferences() { return userPreferences;}
    public  void setUserPreferences(String userPreferences) { this.userPreferences = userPreferences;}

    private double lat;

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    private double lng;
    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    private int zoom;

    public int getZoom() {
        return zoom;
    }

    public void setZoom(int zoom) {
        this.zoom = zoom;
    }

}
