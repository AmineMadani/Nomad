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

@Entity
@Table(name = "tree", schema = "config")
public class Tree implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private Domain domain;
	private Tree tree;
	private Integer numOrder;
	private String alias;
	private String short_;
	private Set<Tree> trees = new HashSet<Tree>(0);
	private Set<Layer> layersForSimplifiedTreeGroupId = new HashSet<Layer>(0);
	private Set<Layer> layersForTreeGroupId = new HashSet<Layer>(0);

	public Tree() {
	}

	public Tree(int id) {
		this.id = id;
	}

	public Tree(int id, Domain domain, Tree tree, Integer numOrder, String alias, String short_, Set<Tree> trees,
			Set<Layer> layersForSimplifiedTreeGroupId, Set<Layer> layersForTreeGroupId) {
		this.id = id;
		this.domain = domain;
		this.tree = tree;
		this.numOrder = numOrder;
		this.alias = alias;
		this.short_ = short_;
		this.trees = trees;
		this.layersForSimplifiedTreeGroupId = layersForSimplifiedTreeGroupId;
		this.layersForTreeGroupId = layersForTreeGroupId;
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
	@JoinColumn(name = "domain_type")
	public Domain getDomain() {
		return this.domain;
	}

	public void setDomain(Domain domain) {
		this.domain = domain;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent_id")
	public Tree getTree() {
		return this.tree;
	}

	public void setTree(Tree tree) {
		this.tree = tree;
	}

	@Column(name = "num_order")
	public Integer getNumOrder() {
		return this.numOrder;
	}

	public void setNumOrder(Integer numOrder) {
		this.numOrder = numOrder;
	}

	@Column(name = "alias")
	public String getAlias() {
		return this.alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	@Column(name = "short")
	public String getShort_() {
		return this.short_;
	}

	public void setShort_(String short_) {
		this.short_ = short_;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "tree")
	public Set<Tree> getTrees() {
		return this.trees;
	}

	public void setTrees(Set<Tree> trees) {
		this.trees = trees;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "treeBySimplifiedTreeGroupId")
	public Set<Layer> getLayersForSimplifiedTreeGroupId() {
		return this.layersForSimplifiedTreeGroupId;
	}

	public void setLayersForSimplifiedTreeGroupId(Set<Layer> layersForSimplifiedTreeGroupId) {
		this.layersForSimplifiedTreeGroupId = layersForSimplifiedTreeGroupId;
	}

	@OneToMany(fetch = FetchType.LAZY, mappedBy = "treeByTreeGroupId")
	public Set<Layer> getLayersForTreeGroupId() {
		return this.layersForTreeGroupId;
	}

	public void setLayersForTreeGroupId(Set<Layer> layersForTreeGroupId) {
		this.layersForTreeGroupId = layersForTreeGroupId;
	}

}
