package com.veolia.nextcanope.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "layer", schema = "config")
public class Layer implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private BusinessObject businessObject;
	private Domain domain;
	private Tree treeBySimplifiedTreeGroupId;
	private Tree treeByTreeGroupId;
	private Integer numOrder;
	private Serializable pgTable;
	private String geomColumnName;
	private String uuidColumnName;
	private String geomSrid;
	private String style;
	private String alias;
	private Boolean display;

	public Layer() {
	}

	public Layer(int id, String geomColumnName, String uuidColumnName, String geomSrid) {
		this.id = id;
		this.geomColumnName = geomColumnName;
		this.uuidColumnName = uuidColumnName;
		this.geomSrid = geomSrid;
	}

	public Layer(int id, BusinessObject businessObject, Domain domain, Tree treeBySimplifiedTreeGroupId,
			Tree treeByTreeGroupId, Integer numOrder, Serializable pgTable, String geomColumnName,
			String uuidColumnName, String geomSrid, String style, String alias, Boolean display) {
		this.id = id;
		this.businessObject = businessObject;
		this.domain = domain;
		this.treeBySimplifiedTreeGroupId = treeBySimplifiedTreeGroupId;
		this.treeByTreeGroupId = treeByTreeGroupId;
		this.numOrder = numOrder;
		this.pgTable = pgTable;
		this.geomColumnName = geomColumnName;
		this.uuidColumnName = uuidColumnName;
		this.geomSrid = geomSrid;
		this.style = style;
		this.alias = alias;
		this.display = display;
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
	@JoinColumn(name = "business_object_type")
	public BusinessObject getBusinessObject() {
		return this.businessObject;
	}

	public void setBusinessObject(BusinessObject businessObject) {
		this.businessObject = businessObject;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "domain_type")
	public Domain getDomain() {
		return this.domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "simplified_tree_group_id")
	public Tree getTreeBySimplifiedTreeGroupId() {
		return this.treeBySimplifiedTreeGroupId;
	}

	public void setTreeBySimplifiedTreeGroupId(Tree treeBySimplifiedTreeGroupId) {
		this.treeBySimplifiedTreeGroupId = treeBySimplifiedTreeGroupId;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tree_group_id")
	public Tree getTreeByTreeGroupId() {
		return this.treeByTreeGroupId;
	}

	public void setTreeByTreeGroupId(Tree treeByTreeGroupId) {
		this.treeByTreeGroupId = treeByTreeGroupId;
	}

	@Column(name = "num_order")
	public Integer getNumOrder() {
		return this.numOrder;
	}

	public void setNumOrder(Integer numOrder) {
		this.numOrder = numOrder;
	}

	@Column(name = "pg_table")
	public Serializable getPgTable() {
		return this.pgTable;
	}

	public void setPgTable(Serializable pgTable) {
		this.pgTable = pgTable;
	}

	@Column(name = "geom_column_name", nullable = false)
	public String getGeomColumnName() {
		return this.geomColumnName;
	}

	public void setGeomColumnName(String geomColumnName) {
		this.geomColumnName = geomColumnName;
	}

	@Column(name = "uuid_column_name", nullable = false)
	public String getUuidColumnName() {
		return this.uuidColumnName;
	}

	public void setUuidColumnName(String uuidColumnName) {
		this.uuidColumnName = uuidColumnName;
	}

	@Column(name = "geom_srid", nullable = false)
	public String getGeomSrid() {
		return this.geomSrid;
	}

	public void setGeomSrid(String geomSrid) {
		this.geomSrid = geomSrid;
	}

	@Column(name = "style")
	public String getStyle() {
		return this.style;
	}

	public void setStyle(String style) {
		this.style = style;
	}

	@Column(name = "alias")
	public String getAlias() {
		return this.alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	@Column(name = "display")
	public Boolean getDisplay() {
		return this.display;
	}

	public void setDisplay(Boolean display) {
		this.display = display;
	}

}
