/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import jakarta.persistence.*;



import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * JPA entity class for "TextSetting"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="text_setting", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class TextSetting implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @Column(name="name", nullable=false, length=2147483647)
    private String name ;

    //--- ENTITY DATA FIELDS 
    @Column(name="value", length=2147483647)
	@JsonProperty("value")
    private String value ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    /**
     * Constructor
     */
    public TextSetting() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setName( String name ) {
        this.name = name ;
    }
    public String getName() {
        return this.name;
    }

	public void setValue( String value ) {
        this.value = value ;
    }

    public String getValue() {
        return this.value;
    }

    //--- GETTERS FOR LINKS

}
