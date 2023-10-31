package com.veolia.nextcanope.dto.FormTemplate;

public class FormTemplateUpdateDto {
    private Long fteId;
    private String fteCode;
    private Long fdnId;
    private String fdnCode;
    private String fdnDefinition;

    public Long getFteId() {
        return fteId;
    }

    public void setFteId(Long fteId) {
        this.fteId = fteId;
    }

    public String getFteCode() {
        return fteCode;
    }

    public void setFteCode(String fteCode) {
        this.fteCode = fteCode;
    }

    public Long getFdnId() {
        return fdnId;
    }

    public void setFdnId(Long fdnId) {
        this.fdnId = fdnId;
    }

    public String getFdnCode() {
        return fdnCode;
    }

    public void setFdnCode(String fdnCode) {
        this.fdnCode = fdnCode;
    }

    public String getFdnDefinition() {
        return fdnDefinition;
    }

    public void setFdnDefinition(String fdnDefinition) {
        this.fdnDefinition = fdnDefinition;
    }
}
