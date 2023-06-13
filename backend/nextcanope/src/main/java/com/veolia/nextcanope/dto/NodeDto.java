package com.veolia.nextcanope.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.veolia.nextcanope.model.Tree;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class NodeDto {
    private Long id;
    @JsonIgnore
    private Long parentId;

    private String name;
    private String styleId;

    private String layerName;


    private String imgSrc;
    private List<NodeDto> children;


    public NodeDto(Tree tree) {
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

    public List<NodeDto> getChildren() {
        return children;
    }

    public void setChildren(List<NodeDto> children) {
        this.children = children;
    }

    public void addChild(NodeDto child) {
        if (this.children == null) {
            this.children = new ArrayList<>();
        }
        if (!this.children.contains(child) && child != null) this.children.add(child);
    }
}
