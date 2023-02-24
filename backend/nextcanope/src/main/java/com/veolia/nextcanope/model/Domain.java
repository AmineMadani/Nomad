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
@Table(name = "domain", schema = "config", uniqueConstraints = @UniqueConstraint(columnNames = "type"))
public class Domain implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private Domain domain;
	private String type;
	private String short_;
	private String alias;
	private Set<Tree> trees = new HashSet<Tree>(0);
	private Set<BusinessObject> businessObjects = new HashSet<BusinessObject>(0);
	private Set<Layer> layers = new HashSet<Layer>(0);
	private Set<Domain> domains = new HashSet<Domain>(0);

	public Domain() {
	}

	public Domain(int id, String type) {
		this.id = id;
		this.type = type;
	}

	public Domain(int id, Domain domain, String type, String short_, String alias, Set<Tree> trees, Set<BusinessObject> businessObjects,
			Set<Layer> layers, Set<Domain> domains) {
		this.id = id;
		this.domain = domain;
		this.type = type;
		this.short_ = short_;
		this.alias = alias;
		this.trees = trees;
		this.businessObjects = businessObjects;
		this.layers = layers;
		this.domains = domains;
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
	@JoinColumn(name = "parent_type")
	public Domain getDomain() {
		return this.domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	@Column(name = "type", unique = true, nullable = false)
	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(name = "short")
	public String getShort_() {
		return this.short_;
	}

	public void setShort_(String short_) {
		this.short_ = short_;
	}

	@Column(name = "alias")
	public String getAlias() {
		return this.alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "domain")
	public Set<Tree> getTrees() {
		return this.trees;
	}

	public void setTrees(Set<Tree> trees) {
		this.trees = trees;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "domain")
	public Set<BusinessObject> getBusinessObjects() {
		return this.businessObjects;
	}

	public void setBusinessObjects(Set<BusinessObject> businessObjects) {
		this.businessObjects = businessObjects;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "domain")
	public Set<Layer> getLayers() {
		return this.layers;
	}

	public void setLayers(Set<Layer> layers) {
		this.layers = layers;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "domain")
	public Set<Domain> getDomains() {
		return this.domains;
	}

	public void setDomains(Set<Domain> domains) {
		this.domains = domains;
	}

}
