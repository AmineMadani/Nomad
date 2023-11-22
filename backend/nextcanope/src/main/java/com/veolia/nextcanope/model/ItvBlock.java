package com.veolia.nextcanope.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

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

    @OneToMany(mappedBy="itvBlock")
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

    public List<ItvBlockData> getListOfItvBlockData() {
        return listOfItvBlockData;
    }

    public void setListOfItvBlockData(List<ItvBlockData> listOfItvBlockData) {
        this.listOfItvBlockData = listOfItvBlockData;
    }
}
