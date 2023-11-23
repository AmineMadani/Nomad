package com.veolia.nextcanope.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.io.Serializable;

@Entity
@Table(name="ITV_VERSION_ALIAS", schema="nomad" )
public class ItvVersionAlias implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    private String label;
    private String version;

    public ItvVersionAlias() {
        super();
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }
}
