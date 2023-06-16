package com.veolia.nextcanope.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.veolia.nextcanope.model.Tree;

import java.util.ArrayList;
import java.util.List;

/**
 * Dto for tree Entity
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TreeDto {
    private Long id;
    @JsonIgnore
    private Long parentId;

    private String name;
    private String styleId;

    private String layerName;


    private String imgSrc;
    private List<TreeDto> children;


    public TreeDto(Tree tree) {
        super();
        this.id = tree.getId();
        this.name = tree.getTreSlabel();
        this.parentId = tree.getTreParentId();
        this.styleId = tree.getStyleId();
        this.imgSrc = tree.getTreImg();
        if (tree.getLayer() != null) {
            this.layerName = tree.getLayer().getLyrTableName();
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentId() {
        return parentId;
    }

    public String getLayerName() {
        return layerName;
    }

    public void setLayerName(String layerName) {
        this.layerName = layerName;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getStyleId() {
        return styleId;
    }

    public void setStyleId(String styleId) {
        this.styleId = styleId;
    }

    public String getImgSrc() {
        return imgSrc;
    }

    public void setImgSrc(String imgSrc) {
        this.imgSrc = imgSrc;
    }

    public List<TreeDto> getChildren() {
        return children;
    }

    public void setChildren(List<TreeDto> children) {
        this.children = children;
    }

    public void addChild(TreeDto child) {
        if (this.children == null) {
            this.children = new ArrayList<>();
        }
        if (!this.children.contains(child) && child != null) this.children.add(child);
    }
}
