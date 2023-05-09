package com.veolia.nextcanope.dto;

public class userContextDto {
    private String userPreferences;

    public  String getUserPreferences() { return userPreferences;}
    public  void setUserPreferences(String userPreferences) { this.userPreferences = userPreferences;}
    private int[] center;

    public int[] getCenter() {
        return center;
    }

    public void setCenter(int[] center) {
        this.center = center;
    }

    private int zoom;

    public int getZoom() {
        return zoom;
    }

    public void setZoom(int zoom) {
        this.zoom = zoom;
    }

}
