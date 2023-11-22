package com.veolia.nextcanope.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.io.Serializable;

@Entity
@Table(name="ITV_VERSION_ENUM", schema="nomad" )
@IdClass(ItvVersionEnumId.class)
public class ItvVersionEnum implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String version;
    @Id
    private String code;
    @Id
    private String condition;
    @Id
    private String val;
    private String label;
    private String realVersion;

    public ItvVersionEnum() {
        super();
    }

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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getRealVersion() {
        return realVersion;
    }

    public void setRealVersion(String realVersion) {
        this.realVersion = realVersion;
    }
}
