package com.veolia.nextcanope.dto.account;

import java.util.List;

public class AccountPerimeterDto {
    private List<Long> contractIds;
    private Long profileId;

    public List<Long> getContractIds() {
        return contractIds;
    }

    public void setContractIds(List<Long> contractIds) {
        this.contractIds = contractIds;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }
}
