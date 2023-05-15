/*
 * Created on 2023-05-15 ( 10:43:07 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import jakarta.persistence.*;

/**
 * JPA entity class for "FloatSetting"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="float_setting", schema="nomad" )
public class FloatSetting implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @Column(name="name", nullable=false, length=2147483647)
    private String name ;

    //--- ENTITY DATA FIELDS 
    @Column(name="value")
    private Double value ;


    //--- ENTITY LINKS ( RELATIONSHIP )

    /**
     * Constructor
     */
    public FloatSetting() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setName( String name ) {
        this.name = name ;
    }
    public String getName() {
        return this.name;
    }

    public void setValue( Double value ) {
        this.value = value ;
    }
    public Double getValue() {
        return this.value;
    }

    //--- GETTERS FOR LINKS

}
