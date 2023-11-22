package com.veolia.nextcanope.model;

import java.io.Serializable;

public class ItvVersionId implements Serializable {
    private static final long serialVersionUID = 1L;

    private String version;
    private String code;

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
