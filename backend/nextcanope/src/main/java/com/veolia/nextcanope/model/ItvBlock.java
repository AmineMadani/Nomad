package com.veolia.nextcanope.model;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name="ITV_BLOCK", schema="nomad" )
public class ItvBlock implements Serializable {
    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="itb_obj_ref", length=2147483647)
    @JsonProperty("itb_obj_ref")
    private String itbObjRef;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="itv_id", referencedColumnName="id")
    private Itv itv;

    @ManyToOne
    @JoinColumn(name="itb_obj_table", referencedColumnName="lyr_table_name")
    private Layer layer;

    @Column(name="itb_structural_defect")
    private Boolean itbStructuralDefect;

    @Column(name="itb_functional_defect")
    private Boolean itbFunctionalDefect;

    @Column(name="itb_observation")
    private Boolean itbObservation;

    @OneToMany(cascade = { CascadeType.MERGE, CascadeType.PERSIST }, mappedBy="itvBlock")
    private List<ItvBlockData> listOfItvBlockData;

    /**
     * Constructor
     */
    public ItvBlock() {
        super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItbObjRef() {
        return itbObjRef;
    }

    public void setItbObjRef(String itbObjRef) {
        this.itbObjRef = itbObjRef;
    }

    public Itv getItv() {
        return itv;
    }

    public void setItv(Itv itv) {
        this.itv = itv;
    }

    public Layer getLayer() {
        return layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

    public Boolean getItbStructuralDefect() {
        return itbStructuralDefect;
    }

    public void setItbStructuralDefect(Boolean itbStructuralDefect) {
        this.itbStructuralDefect = itbStructuralDefect;
    }

    public Boolean getItbFunctionalDefect() {
        return itbFunctionalDefect;
    }

    public void setItbFunctionalDefect(Boolean itbFunctionalDefect) {
        this.itbFunctionalDefect = itbFunctionalDefect;
    }

    public Boolean getItbObservation() {
        return itbObservation;
    }

    public void setItbObservation(Boolean itbObservation) {
        this.itbObservation = itbObservation;
    }

    public List<ItvBlockData> getListOfItvBlockData() {
        return listOfItvBlockData;
    }

    public void setListOfItvBlockData(List<ItvBlockData> listOfItvBlockData) {
        this.listOfItvBlockData = listOfItvBlockData;
    }
}
