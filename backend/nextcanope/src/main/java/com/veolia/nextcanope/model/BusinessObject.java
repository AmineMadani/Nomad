package com.veolia.nextcanope.model;

import java.util.HashSet;
import java.util.Set;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "business_object", schema = "config", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "domain_type", "type" }), @UniqueConstraint(columnNames = "type") })
public class BusinessObject implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private Domain domain;
	private VlTopologyType vlTopologyType;
	private String type;
	private Set<Layer> layers = new HashSet<Layer>(0);

	public BusinessObject() {
	}

	public BusinessObject(int id, Domain domain, String type) {
		this.id = id;
		this.domain = domain;
		this.type = type;
	}

	public BusinessObject(int id, Domain domain, VlTopologyType vlTopologyType, String type, Set<Layer> layers) {
		this.id = id;
		this.domain = domain;
		this.vlTopologyType = vlTopologyType;
		this.type = type;
		this.layers = layers;
	}

	@Id

	@Column(name = "id", unique = true, nullable = false)
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "domain_type", nullable = false)
	public Domain getDomain() {
		return this.domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "topology_type")
	public VlTopologyType getVlTopologyType() {
		return this.vlTopologyType;
	}

	public void setVlTopologyType(VlTopologyType vlTopologyType) {
		this.vlTopologyType = vlTopologyType;
	}

	@Column(name = "type", unique = true, nullable = false)
	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "businessObject")
	public Set<Layer> getLayers() {
		return this.layers;
	}

	public void setLayers(Set<Layer> layers) {
		this.layers = layers;
	}

}
