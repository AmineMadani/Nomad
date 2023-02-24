package com.veolia.nextcanope.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "text_setting", schema = "config")
public class TextSetting implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private String name;
	private String value;

	public TextSetting() {
	}

	public TextSetting(String name) {
		this.name = name;
	}

	public TextSetting(String name, String value) {
		this.name = name;
		this.value = value;
	}

	@Id

	@Column(name = "name", unique = true, nullable = false)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "value")
	public String getValue() {
		return this.value;
	}

	public void setValue(String value) {
		this.value = value;
	}

}
