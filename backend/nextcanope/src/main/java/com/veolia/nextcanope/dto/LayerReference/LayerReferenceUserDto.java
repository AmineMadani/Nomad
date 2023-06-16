package com.veolia.nextcanope.dto.LayerReference;

public class LayerReferenceUserDto {
    public LayerReferenceUserDto() {
    }

    public LayerReferenceUserDto(LayerReferencesFlatDto item) {
        this.referenceId = item.getReferenceId();
        this.referenceKey = item.getReferenceKey();
        this.alias = item.getAlias();
        this.displayType = item.getDisplayType();
        this.position = item.getPosition();
        this.isVisible = item.getIsVisible();
        this.section = item.getSection();
        this.valid = item.getValid();
    }

    private Long referenceId;
    private String referenceKey;
    private String alias;
    private String displayType;
    private Integer position;
    private Boolean isVisible;
    private String section;
    private Boolean valid;

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceKey() {
        return referenceKey;
    }

    public void setReferenceKey(String referenceKey) {
        this.referenceKey = referenceKey;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getDisplayType() {
        return displayType;
    }

    public void setDisplayType(String displayType) {
        this.displayType = displayType;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Boolean getValid() {
        return valid;
    }

    public void setValid(Boolean valid) {
        this.valid = valid;
    }
}
