package com.veolia.nextcanope.dto.payload;

import java.util.List;

public class DeleteFormTemplateCustomUserPayload {
    private Long id;
    private List<Long> userIds;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}
