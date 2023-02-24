package com.veolia.nextcanope.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "float_setting", schema = "config")
public class FloatSetting implements java.io.Serializable {

	private static final long serialVersionUID = 1L;
	private String name;
	private Double value;

	public FloatSetting() {
	}

	public FloatSetting(String name) {
		this.name = name;
	}

	public FloatSetting(String name, Double value) {
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

	@Column(name = "value", precision = 17, scale = 17)
	public Double getValue() {
		return this.value;
	}

	public void setValue(Double value) {
		this.value = value;
	}

}
