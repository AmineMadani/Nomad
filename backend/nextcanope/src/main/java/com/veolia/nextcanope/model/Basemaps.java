package com.veolia.nextcanope.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "basemaps", schema = "config")
public class Basemaps implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private int id;
	private String alias;
	private String type;
	private String url;
	private String layer;
	private String matrixset;
	private String format;
	private String projection;
	private String tilegrid;
	private String style;
	private String attributions;
	private Boolean default_;
	private Boolean display;
	private byte[] thumbnail;

	public Basemaps() {
	}

	public Basemaps(int id) {
		this.id = id;
	}

	public Basemaps(int id, String alias, String type, String url, String layer, String matrixset, String format,
			String projection, String tilegrid, String style, String attributions, Boolean default_, Boolean display,
			byte[] thumbnail) {
		this.id = id;
		this.alias = alias;
		this.type = type;
		this.url = url;
		this.layer = layer;
		this.matrixset = matrixset;
		this.format = format;
		this.projection = projection;
		this.tilegrid = tilegrid;
		this.style = style;
		this.attributions = attributions;
		this.default_ = default_;
		this.display = display;
		this.thumbnail = thumbnail;
	}

	@Id

	@Column(name = "id", unique = true, nullable = false)
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Column(name = "alias")
	public String getAlias() {
		return this.alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	@Column(name = "type")
	public String getType() {
		return this.type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(name = "url")
	public String getUrl() {
		return this.url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	@Column(name = "layer")
	public String getLayer() {
		return this.layer;
	}

	public void setLayer(String layer) {
		this.layer = layer;
	}

	@Column(name = "matrixset")
	public String getMatrixset() {
		return this.matrixset;
	}

	public void setMatrixset(String matrixset) {
		this.matrixset = matrixset;
	}

	@Column(name = "format")
	public String getFormat() {
		return this.format;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	@Column(name = "projection")
	public String getProjection() {
		return this.projection;
	}

	public void setProjection(String projection) {
		this.projection = projection;
	}

	@Column(name = "tilegrid")
	public String getTilegrid() {
		return this.tilegrid;
	}

	public void setTilegrid(String tilegrid) {
		this.tilegrid = tilegrid;
	}

	@Column(name = "style")
	public String getStyle() {
		return this.style;
	}

	public void setStyle(String style) {
		this.style = style;
	}

	@Column(name = "attributions")
	public String getAttributions() {
		return this.attributions;
	}

	public void setAttributions(String attributions) {
		this.attributions = attributions;
	}

	@Column(name = "default")
	public Boolean getDefault_() {
		return this.default_;
	}

	public void setDefault_(Boolean default_) {
		this.default_ = default_;
	}

	@Column(name = "display")
	public Boolean getDisplay() {
		return this.display;
	}

	public void setDisplay(Boolean display) {
		this.display = display;
	}

	@Column(name = "thumbnail")
	public byte[] getThumbnail() {
		return this.thumbnail;
	}

	public void setThumbnail(byte[] thumbnail) {
		this.thumbnail = thumbnail;
	}

}
