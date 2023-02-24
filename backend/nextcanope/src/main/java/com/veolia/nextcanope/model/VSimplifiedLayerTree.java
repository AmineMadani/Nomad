package com.veolia.nextcanope.model;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "v_simplified_layer_tree", schema = "config")
public class VSimplifiedLayerTree implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private VSimplifiedLayerTreeId id;

	public VSimplifiedLayerTree() {
	}

	public VSimplifiedLayerTree(VSimplifiedLayerTreeId id) {
		this.id = id;
	}

	@EmbeddedId

	@AttributeOverrides({ @AttributeOverride(name = "parentDomainType", column = @Column(name = "parent_domain_type")),
			@AttributeOverride(name = "parentDomainAlias", column = @Column(name = "parent_domain_alias")),
			@AttributeOverride(name = "tab", column = @Column(name = "tab")),
			@AttributeOverride(name = "treeGroup", column = @Column(name = "tree_group")),
			@AttributeOverride(name = "id", column = @Column(name = "id")),
			@AttributeOverride(name = "numOrder", column = @Column(name = "num_order")),
			@AttributeOverride(name = "domainType", column = @Column(name = "domain_type")),
			@AttributeOverride(name = "businessObjectType", column = @Column(name = "business_object_type")),
			@AttributeOverride(name = "treeGroupId", column = @Column(name = "tree_group_id")),
			@AttributeOverride(name = "simplifiedTreeGroupId", column = @Column(name = "simplified_tree_group_id")),
			@AttributeOverride(name = "pgTable", column = @Column(name = "pg_table")),
			@AttributeOverride(name = "geomColumnName", column = @Column(name = "geom_column_name")),
			@AttributeOverride(name = "uuidColumnName", column = @Column(name = "uuid_column_name")),
			@AttributeOverride(name = "geomSrid", column = @Column(name = "geom_srid")),
			@AttributeOverride(name = "style", column = @Column(name = "style")),
			@AttributeOverride(name = "alias", column = @Column(name = "alias")),
			@AttributeOverride(name = "display", column = @Column(name = "display")) })
	public VSimplifiedLayerTreeId getId() {
		return this.id;
	}

	public void setId(VSimplifiedLayerTreeId id) {
		this.id = id;
	}

}
