package com.veolia.nextcanope.dto.itv;

import java.util.Date;
import java.util.List;

public class ItvDetailDto {
    private Long id;
    private String itvFilename;
    private String itvStatus;
    private Date itvDcre;
    private List<ItvBlockDetailDto> listItvBlock;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItvFilename() {
        return itvFilename;
    }

    public void setItvFilename(String itvFilename) {
        this.itvFilename = itvFilename;
    }

    public String getItvStatus() {
        return itvStatus;
    }

    public void setItvStatus(String itvStatus) {
        this.itvStatus = itvStatus;
    }

    public Date getItvDcre() {
        return itvDcre;
    }

    public void setItvDcre(Date itvDcre) {
        this.itvDcre = itvDcre;
    }

    public List<ItvBlockDetailDto> getListItvBlock() {
        return listItvBlock;
    }

    public void setListItvBlock(List<ItvBlockDetailDto> listItvBlock) {
        this.listItvBlock = listItvBlock;
    }
}
