/*
 * Created on 2023-04-03 ( 11:41:17 )
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.List;
import jakarta.persistence.*;

/**
 * JPA entity class for "VlTopologyType"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="vl_topology_type", schema="config" )
public class VlTopologyType implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY 
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name="id", nullable=false)
    private Integer id ;

    //--- ENTITY DATA FIELDS 
    @Column(name="type", nullable=false, length=2147483647)
    private String type ;

    @Column(name="required_fields", length=2147483647)
    private String requiredFields ;


    //--- ENTITY LINKS ( RELATIONSHIP )
    @OneToMany(mappedBy="vlTopologyType")
    private List<BusinessObject> listOfBusinessObject ; 


    /**
     * Constructor
     */
    public VlTopologyType() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS
    public void setId( Integer id ) {
        this.id = id ;
    }
    public Integer getId() {
        return this.id;
    }

    public void setType( String type ) {
        this.type = type ;
    }
    public String getType() {
        return this.type;
    }

    public void setRequiredFields( String requiredFields ) {
        this.requiredFields = requiredFields ;
    }
    public String getRequiredFields() {
        return this.requiredFields;
    }

    //--- GETTERS FOR LINKS
    public List<BusinessObject> getListOfBusinessObject() {
        return this.listOfBusinessObject;
    } 


}
