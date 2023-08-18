package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.Profile;

public class ProfileDto {
    private Long id;
    private String prfCode;
    private String prfSlabel;
    private String prfLlabel;
    private Boolean prfValid;

    public ProfileDto(Profile profile) {
        this.id = profile.getId();
        this.prfCode = profile.getPrfCode();
        this.prfSlabel = profile.getPrfSlabel();
        this.prfLlabel = profile.getPrfLlabel();
        this.prfValid = profile.getPrfValid();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPrfCode() {
        return prfCode;
    }

    public void setPrfCode(String prfCode) {
        this.prfCode = prfCode;
    }

    public String getPrfSlabel() {
        return prfSlabel;
    }

    public void setPrfSlabel(String prfSlabel) {
        this.prfSlabel = prfSlabel;
    }

    public String getPrfLlabel() {
        return prfLlabel;
    }

    public void setPrfLlabel(String prfLlabel) {
        this.prfLlabel = prfLlabel;
    }


    public Boolean getPrfValid() {
        return prfValid;
    }

    public void setPrfValid(Boolean prfValid) {
        this.prfValid = prfValid;
    }
}
