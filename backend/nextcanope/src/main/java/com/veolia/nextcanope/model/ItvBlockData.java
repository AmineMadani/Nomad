package com.veolia.nextcanope.model;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name="ITV_BLOCK_DATA", schema="nomad" )
public class ItvBlockData implements Serializable {
    private static final long serialVersionUID = 1L;

    public static final String PARENT_B = "B";
    public static final String PARENT_C = "C";

    //--- ENTITY PRIMARY KEY ---\\
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private Long id;

    //--- ENTITY DATA FIELDS ---\\
    private String ibdParent;
    private Integer ibdLine;
    private String ibdCode;
    private String ibdValue;

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

    public String getIbdParent() {
        return ibdParent;
    }

    public void setIbdParent(String ibdParent) {
        this.ibdParent = ibdParent;
    }

    public Integer getIbdLine() {
        return ibdLine;
    }

    public void setIbdLine(Integer ibdLine) {
        this.ibdLine = ibdLine;
    }

    public String getIbdCode() {
        return ibdCode;
    }

    public void setIbdCode(String ibdCode) {
        this.ibdCode = ibdCode;
    }

    public String getIbdValue() {
        return ibdValue;
    }

    public void setIbdValue(String ibdValue) {
        this.ibdValue = ibdValue;
    }

    public ItvBlock getItvBlock() {
        return itvBlock;
    }

    public void setItvBlock(ItvBlock itvBlock) {
        this.itvBlock = itvBlock;
    }
}
