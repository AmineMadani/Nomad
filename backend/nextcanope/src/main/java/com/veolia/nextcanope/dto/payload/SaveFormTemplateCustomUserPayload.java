package com.veolia.nextcanope.dto.payload;

import com.veolia.nextcanope.dto.FormTemplate.FormTemplateUpdateDto;

import java.util.List;

public class SaveFormTemplateCustomUserPayload {
    private FormTemplateUpdateDto formTemplate;
    private List<Long> userIds;

    public FormTemplateUpdateDto getFormTemplate() {
        return formTemplate;
    }

    public void setFormTemplate(FormTemplateUpdateDto formTemplate) {
        this.formTemplate = formTemplate;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}
