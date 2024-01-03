/*
 * Generated by TelosysTools with the custom VEOLIA template
 */
package com.veolia.nextcanope.model;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;


/**
 * JPA entity class for "LayerGrpAction"
 *
 * @author VEOLIA
 *
 */
@Entity
@Table(name="layer_grp_action", schema="nomad" )
@JsonIgnoreProperties(ignoreUnknown = true)
public class LayerGrpAction implements Serializable {

    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
        @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
private Long id;

    //--- ENTITY DATA FIELDS ---\\
    @Column(name="grp_id", nullable=false)
    @JsonProperty("grp_id")
    private Long grpId;

    @Column(name="grp_label", nullable=false, length=2147483647)
    @JsonProperty("grp_label")
    private String grpLabel;


    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="wtr_id", referencedColumnName="id")
    private WorkorderTaskReason workorderTaskReason;

    @ManyToOne
    @JoinColumn(name="lyr_id", referencedColumnName="id")
    private Layer layer;

    /**
     * Constructor
     */
    public LayerGrpAction() {
		super();
    }
    
    //--- GETTERS & SETTERS FOR FIELDS ---\\
    public Long getId() {
        return this.id;
    }

    public void setId( Long id ) {
        this.id = id ;
    }

    public Long getGrpId() {
        return this.grpId;
    }

	public void setGrpId( Long grpId ) {
        this.grpId = grpId ;
    }

    public String getGrpLabel() {
        return this.grpLabel;
    }

	public void setGrpLabel( String grpLabel ) {
        this.grpLabel = grpLabel ;
    }

    //--- GETTERS AND SETTERS FOR LINKS ---\\
    public WorkorderTaskReason getWorkorderTaskReason() {
        return this.workorderTaskReason;
    }

    public void setWorkorderTaskReason(WorkorderTaskReason workorderTaskReason) {
        this.workorderTaskReason = workorderTaskReason;
    }

    public Layer getLayer() {
        return this.layer;
    }

    public void setLayer(Layer layer) {
        this.layer = layer;
    }

}
