package com.veolia.nextcanope.dto;

public class UserContextDto {
    private String UserPreferences;

    public  String getUserPreferences() { return UserPreferences;}
    public  void setUserPreferences(String userPreferences) { this.UserPreferences = userPreferences;}
    private int[] Center;

    public int[] getCenter() {
        return Center;
    }

    public void setCenter(int[] center) {
        Center = center;
    }

    private int Zoom;

    public int getZoom() {
        return Zoom;
    }

    public void setZoom(int zoom) {
        Zoom = zoom;
    }

}
