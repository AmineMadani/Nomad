package com.veolia.externalVeoliaApi.dto.attachment;

import java.util.Map;

public class AttachmentDto {
    private String id;
    private Map<String, Object> informations;
    private String url;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Map<String, Object> getInformations() {
        return informations;
    }

    public void setInformations(Map<String, Object> informations) {
        this.informations = informations;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
}
