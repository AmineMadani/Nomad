package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "vl_topology_type", schema = "config", uniqueConstraints = @UniqueConstraint(columnNames = "type"))
public class VlTopologyType implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private String type;
	private Serializable requiredFields;
	private Set<BusinessObject> businessObjects = new HashSet<BusinessObject>(0);

	public VlTopologyType() {
	}

	public VlTopologyType(int id, String type) {
		this.id = id;
		this.type = type;
	}

	public VlTopologyType(int id, String type, Serializable requiredFields, Set<BusinessObject> businessObjects) {
		this.id = id;
		this.type = type;
		this.requiredFields = requiredFields;
		this.businessObjects = businessObjects;
	}

	@Id

	@Column(name = "id", unique = true, nullable = false)
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "type", unique = true, nullable = false)
	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(name = "required_fields")
	public Serializable getRequiredFields() {
		return this.requiredFields;
	}

	public void setRequiredFields(Serializable requiredFields) {
		this.requiredFields = requiredFields;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "vlTopologyType")
	public Set<BusinessObject> getBusinessObjects() {
		return this.businessObjects;
	}

	public void setBusinessObjects(Set<BusinessObject> businessObjects) {
		this.businessObjects = businessObjects;
	}

}
