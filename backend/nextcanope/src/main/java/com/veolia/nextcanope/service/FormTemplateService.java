package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.FormTemplate.FormTemplateUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.FormDefinition;
import com.veolia.nextcanope.model.FormTemplate;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.FormDefinitionRepository;
import com.veolia.nextcanope.repository.FormTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FormTemplateService {
    @Autowired
    FormTemplateRepository formTemplateRepository;

    @Autowired
    FormDefinitionRepository formDefinitionRepository;

    @Autowired
    UserService userService;

    public FormTemplate getFormTemplateById(Long id) {
        return formTemplateRepository.findById(id).orElseThrow(() -> new FunctionalException("Le form template avec l'id " + id + " n'existe pas."));
    }

    /**
     *
     * @param formTemplateDto The form to create
     * @param userId he user id who create the form
     * @return The form
     */
    public Long createFormTemplate(FormTemplateUpdateDto formTemplateDto, Long userId) {
        Users user = userService.getUserById(userId);

        FormTemplate formTemplate = new FormTemplate();
        formTemplate.setFteCode(formTemplateDto.getFteCode());
        formTemplate.setCreatedBy(user);
        formTemplate.setModifiedBy(user);

        FormDefinition formDefinition = new FormDefinition();
        formDefinition.setFdnCode(formTemplateDto.getFdnCode());
        formDefinition.setFdnDefinition(formTemplateDto.getFdnDefinition());
        formDefinition.setCreatedBy(user);
        formDefinition.setModifiedBy(user);

        List<FormTemplate> listOfFormTemplate = new ArrayList<>();
        listOfFormTemplate.add(formTemplate);
        formDefinition.setListOfFormTemplate(listOfFormTemplate);

        formTemplate.setFormDefinition(formDefinition);

        try {
            formDefinition = formDefinitionRepository.save(formDefinition);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde du form definition pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return formDefinition.getId();
    }

    /**
     *
     * @param formTemplateDto The form to update
     * @param userId he user id who update the form
     * @return The form
     */
    public Long updateFormTemplate(FormTemplateUpdateDto formTemplateDto, Long userId) {
        Users user = userService.getUserById(userId);

        FormTemplate formTemplate = getFormTemplateById(formTemplateDto.getFteId());
        formTemplate.setFteCode(formTemplateDto.getFteCode());
        formTemplate.setModifiedBy(user);

        FormDefinition formDefinition = formTemplate.getFormDefinition();
        formDefinition.setFdnCode(formTemplateDto.getFdnCode());
        formDefinition.setFdnDefinition(formTemplateDto.getFdnDefinition());
        formDefinition.setModifiedBy(user);

        try {
            formDefinition = formDefinitionRepository.save(formDefinition);
        } catch (Exception e) {
            throw new TechnicalException("Erreur lors de la sauvegarde du form definition pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
        }

        return formDefinition.getId();
    }
}
