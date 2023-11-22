package com.veolia.nextcanope.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name="ITV_BLOCK_DATA", schema="nomad" )
public class ItvBlockData implements Serializable {
    private static final long serialVersionUID = 1L;

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    private String itbParent;
    private String itbCode;
    private String idbValue;

    //--- ENTITY LINKS ( RELATIONSHIP ) ---\\
    @ManyToOne
    @JoinColumn(name="itb_id", referencedColumnName="id")
    private ItvBlock itvBlock;

    /**
     * Constructor
     */
    public ItvBlockData() {
        super();
    }

    //--- GETTERS & SETTERS FOR FIELDS ---\\


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItbParent() {
        return itbParent;
    }

    public void setItbParent(String itbParent) {
        this.itbParent = itbParent;
    }

    public String getItbCode() {
        return itbCode;
    }

    public void setItbCode(String itbCode) {
        this.itbCode = itbCode;
    }

    public String getIdbValue() {
        return idbValue;
    }

    public void setIdbValue(String idbValue) {
        this.idbValue = idbValue;
    }

    public ItvBlock getItvBlock() {
        return itvBlock;
    }

    public void setItvBlock(ItvBlock itvBlock) {
        this.itvBlock = itvBlock;
    }
}
