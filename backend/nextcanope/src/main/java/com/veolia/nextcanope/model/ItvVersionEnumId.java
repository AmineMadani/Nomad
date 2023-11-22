package com.veolia.nextcanope.model;

import java.io.Serializable;

public class ItvVersionEnumId implements Serializable {
    private static final long serialVersionUID = 1L;

    private String version;
    private String code;
    private String condition;
    private String val;

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

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getVal() {
        return val;
    }

    public void setVal(String val) {
        this.val = val;
    }
}
