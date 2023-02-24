package com.veolia.nextcanope.model;

import java.io.Serializable;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class VSimplifiedLayerTreeId implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private String parentDomainType;
	private String parentDomainAlias;
	private String tab;
	private String treeGroup;
	private Integer id;
	private Integer numOrder;
	private String domainType;
	private String businessObjectType;
	private Integer treeGroupId;
	private Integer simplifiedTreeGroupId;
	private Serializable pgTable;
	private String geomColumnName;
	private String uuidColumnName;
	private String geomSrid;
	private String style;
	private String alias;
	private Boolean display;

	public VSimplifiedLayerTreeId() {
	}

	public VSimplifiedLayerTreeId(String parentDomainType, String parentDomainAlias, String tab, String treeGroup,
			Integer id, Integer numOrder, String domainType, String businessObjectType, Integer treeGroupId,
			Integer simplifiedTreeGroupId, Serializable pgTable, String geomColumnName, String uuidColumnName,
			String geomSrid, String style, String alias, Boolean display) {
		this.parentDomainType = parentDomainType;
		this.parentDomainAlias = parentDomainAlias;
		this.tab = tab;
		this.treeGroup = treeGroup;
		this.id = id;
		this.numOrder = numOrder;
		this.domainType = domainType;
		this.businessObjectType = businessObjectType;
		this.treeGroupId = treeGroupId;
		this.simplifiedTreeGroupId = simplifiedTreeGroupId;
		this.pgTable = pgTable;
		this.geomColumnName = geomColumnName;
		this.uuidColumnName = uuidColumnName;
		this.geomSrid = geomSrid;
		this.style = style;
		this.alias = alias;
		this.display = display;
	}

	@Column(name = "parent_domain_type")
	public String getParentDomainType() {
		return this.parentDomainType;
	}

	public void setParentDomainType(String parentDomainType) {
		this.parentDomainType = parentDomainType;
	}

	@Column(name = "parent_domain_alias")
	public String getParentDomainAlias() {
		return this.parentDomainAlias;
	}

	public void setParentDomainAlias(String parentDomainAlias) {
		this.parentDomainAlias = parentDomainAlias;
	}

	@Column(name = "tab")
	public String getTab() {
		return this.tab;
	}

	public void setTab(String tab) {
		this.tab = tab;
	}

	@Column(name = "tree_group")
	public String getTreeGroup() {
		return this.treeGroup;
	}

	public void setTreeGroup(String treeGroup) {
		this.treeGroup = treeGroup;
	}

	@Column(name = "id")
	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column(name = "num_order")
	public Integer getNumOrder() {
		return this.numOrder;
	}

	public void setNumOrder(Integer numOrder) {
		this.numOrder = numOrder;
	}

	@Column(name = "domain_type")
	public String getDomainType() {
		return this.domainType;
	}

	public void setDomainType(String domainType) {
		this.domainType = domainType;
	}

	@Column(name = "business_object_type")
	public String getBusinessObjectType() {
		return this.businessObjectType;
	}

	public void setBusinessObjectType(String businessObjectType) {
		this.businessObjectType = businessObjectType;
	}

	@Column(name = "tree_group_id")
	public Integer getTreeGroupId() {
		return this.treeGroupId;
	}

	public void setTreeGroupId(Integer treeGroupId) {
		this.treeGroupId = treeGroupId;
	}

	@Column(name = "simplified_tree_group_id")
	public Integer getSimplifiedTreeGroupId() {
		return this.simplifiedTreeGroupId;
	}

	public void setSimplifiedTreeGroupId(Integer simplifiedTreeGroupId) {
		this.simplifiedTreeGroupId = simplifiedTreeGroupId;
	}

	@Column(name = "pg_table")
	public Serializable getPgTable() {
		return this.pgTable;
	}

	public void setPgTable(Serializable pgTable) {
		this.pgTable = pgTable;
	}

	@Column(name = "geom_column_name")
	public String getGeomColumnName() {
		return this.geomColumnName;
	}

	public void setGeomColumnName(String geomColumnName) {
		this.geomColumnName = geomColumnName;
	}

	@Column(name = "uuid_column_name")
	public String getUuidColumnName() {
		return this.uuidColumnName;
	}

	public void setUuidColumnName(String uuidColumnName) {
		this.uuidColumnName = uuidColumnName;
	}

	@Column(name = "geom_srid")
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

	public boolean equals(Object other) {
		if ((this == other))
			return true;
		if ((other == null))
			return false;
		if (!(other instanceof VSimplifiedLayerTreeId))
			return false;
		VSimplifiedLayerTreeId castOther = (VSimplifiedLayerTreeId) other;

		return ((this.getParentDomainType() == castOther.getParentDomainType())
				|| (this.getParentDomainType() != null && castOther.getParentDomainType() != null
						&& this.getParentDomainType().equals(castOther.getParentDomainType())))
				&& ((this.getParentDomainAlias() == castOther.getParentDomainAlias())
						|| (this.getParentDomainAlias() != null && castOther.getParentDomainAlias() != null
								&& this.getParentDomainAlias().equals(castOther.getParentDomainAlias())))
				&& ((this.getTab() == castOther.getTab()) || (this.getTab() != null && castOther.getTab() != null
						&& this.getTab().equals(castOther.getTab())))
				&& ((this.getTreeGroup() == castOther.getTreeGroup()) || (this.getTreeGroup() != null
						&& castOther.getTreeGroup() != null && this.getTreeGroup().equals(castOther.getTreeGroup())))
				&& ((this.getId() == castOther.getId()) || (this.getId() != null && castOther.getId() != null
						&& this.getId().equals(castOther.getId())))
				&& ((this.getNumOrder() == castOther.getNumOrder()) || (this.getNumOrder() != null
						&& castOther.getNumOrder() != null && this.getNumOrder().equals(castOther.getNumOrder())))
				&& ((this.getDomainType() == castOther.getDomainType()) || (this.getDomainType() != null
						&& castOther.getDomainType() != null && this.getDomainType().equals(castOther.getDomainType())))
				&& ((this.getBusinessObjectType() == castOther.getBusinessObjectType())
						|| (this.getBusinessObjectType() != null && castOther.getBusinessObjectType() != null
								&& this.getBusinessObjectType().equals(castOther.getBusinessObjectType())))
				&& ((this.getTreeGroupId() == castOther.getTreeGroupId())
						|| (this.getTreeGroupId() != null && castOther.getTreeGroupId() != null
								&& this.getTreeGroupId().equals(castOther.getTreeGroupId())))
				&& ((this.getSimplifiedTreeGroupId() == castOther.getSimplifiedTreeGroupId())
						|| (this.getSimplifiedTreeGroupId() != null && castOther.getSimplifiedTreeGroupId() != null
								&& this.getSimplifiedTreeGroupId().equals(castOther.getSimplifiedTreeGroupId())))
				&& ((this.getPgTable() == castOther.getPgTable()) || (this.getPgTable() != null
						&& castOther.getPgTable() != null && this.getPgTable().equals(castOther.getPgTable())))
				&& ((this.getGeomColumnName() == castOther.getGeomColumnName())
						|| (this.getGeomColumnName() != null && castOther.getGeomColumnName() != null
								&& this.getGeomColumnName().equals(castOther.getGeomColumnName())))
				&& ((this.getUuidColumnName() == castOther.getUuidColumnName())
						|| (this.getUuidColumnName() != null && castOther.getUuidColumnName() != null
								&& this.getUuidColumnName().equals(castOther.getUuidColumnName())))
				&& ((this.getGeomSrid() == castOther.getGeomSrid()) || (this.getGeomSrid() != null
						&& castOther.getGeomSrid() != null && this.getGeomSrid().equals(castOther.getGeomSrid())))
				&& ((this.getStyle() == castOther.getStyle()) || (this.getStyle() != null
						&& castOther.getStyle() != null && this.getStyle().equals(castOther.getStyle())))
				&& ((this.getAlias() == castOther.getAlias()) || (this.getAlias() != null
						&& castOther.getAlias() != null && this.getAlias().equals(castOther.getAlias())))
				&& ((this.getDisplay() == castOther.getDisplay()) || (this.getDisplay() != null
						&& castOther.getDisplay() != null && this.getDisplay().equals(castOther.getDisplay())));
	}

	public int hashCode() {
		int result = 17;

		result = 37 * result + (getParentDomainType() == null ? 0 : this.getParentDomainType().hashCode());
		result = 37 * result + (getParentDomainAlias() == null ? 0 : this.getParentDomainAlias().hashCode());
		result = 37 * result + (getTab() == null ? 0 : this.getTab().hashCode());
		result = 37 * result + (getTreeGroup() == null ? 0 : this.getTreeGroup().hashCode());
		result = 37 * result + (getId() == null ? 0 : this.getId().hashCode());
		result = 37 * result + (getNumOrder() == null ? 0 : this.getNumOrder().hashCode());
		result = 37 * result + (getDomainType() == null ? 0 : this.getDomainType().hashCode());
		result = 37 * result + (getBusinessObjectType() == null ? 0 : this.getBusinessObjectType().hashCode());
		result = 37 * result + (getTreeGroupId() == null ? 0 : this.getTreeGroupId().hashCode());
		result = 37 * result + (getSimplifiedTreeGroupId() == null ? 0 : this.getSimplifiedTreeGroupId().hashCode());
		result = 37 * result + (getPgTable() == null ? 0 : this.getPgTable().hashCode());
		result = 37 * result + (getGeomColumnName() == null ? 0 : this.getGeomColumnName().hashCode());
		result = 37 * result + (getUuidColumnName() == null ? 0 : this.getUuidColumnName().hashCode());
		result = 37 * result + (getGeomSrid() == null ? 0 : this.getGeomSrid().hashCode());
		result = 37 * result + (getStyle() == null ? 0 : this.getStyle().hashCode());
		result = 37 * result + (getAlias() == null ? 0 : this.getAlias().hashCode());
		result = 37 * result + (getDisplay() == null ? 0 : this.getDisplay().hashCode());
		return result;
	}

}
