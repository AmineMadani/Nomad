package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.FormTemplate.FormTemplateUpdateDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.model.FormDefinition;
import com.veolia.nextcanope.model.FormTemplate;
import com.veolia.nextcanope.model.FormTemplateCustom;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.FormDefinitionRepository;
import com.veolia.nextcanope.repository.FormTemplateCustomRepository;
import com.veolia.nextcanope.repository.FormTemplateRepository;

@Service
public class FormTemplateService {
    @Autowired
    FormTemplateRepository formTemplateRepository;

    @Autowired
    FormDefinitionRepository formDefinitionRepository;

    @Autowired
    FormTemplateCustomRepository formTemplateCustomRepository;

    @Autowired
    UserService userService;

    public FormTemplate getFormTemplateById(Long id) {
        return formTemplateRepository.findById(id).orElseThrow(() -> new FunctionalException("Le form template avec l'id " + id + " n'existe pas."));
    }

    /**
     *
     * @param formTemplateDto The form to create
     * @param userId the user id who create the form
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
     * @param userId the user id who update the form
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

    /**
     * Save the form template custom for the list of user
     * If it already exists then update it else create it
     * @param formTemplateDto The form to save
     * @param listUserId the list of user id for which to save the form
     * @param currentUserId Id of the user saving
     */
    public void saveFormTemplateCustomUser(FormTemplateUpdateDto formTemplateDto, List<Long> listUserId, Long currentUserId) {
        // Get the default template
        FormTemplate formTemplate = getFormTemplateById(formTemplateDto.getFteId());

        // Get the user doing the action
        Users currentUser = userService.getUserById(currentUserId);

        // For each user
        for (Long userId : listUserId) {
            // Check if there is already a custom template
            FormTemplateCustom formTemplateCustom = formTemplateCustomRepository.findByFormTemplate_IdAndUser_IdAndDeletedAtIsNull(formTemplateDto.getFteId(), userId).orElse(null);

            FormDefinition formDefinition;

            // If there is no custom template, create it
            if (formTemplateCustom == null) {
                // Get the user for which we are creating the custom form template
                Users user = userService.getUserById(userId);

                // Form template custom
                formTemplateCustom = new FormTemplateCustom();
                formTemplateCustom.setFormTemplate(formTemplate);
                formTemplateCustom.setUser(user);
                formTemplateCustom.setCreatedBy(currentUser);
                formTemplateCustom.setModifiedBy(currentUser);

                // Linked Form template custom
                formTemplate.getListOfFormTemplateCustom().add(formTemplateCustom);

                // Create the associated definition
                formDefinition = new FormDefinition();
                formDefinition.setFdnCode(formTemplateDto.getFdnCode());
                formDefinition.setFdnDefinition(formTemplateDto.getFdnDefinition());
                formDefinition.setCreatedBy(currentUser);
                formDefinition.setModifiedBy(currentUser);

                List<FormTemplateCustom> listOfFormTemplateCustom = new ArrayList<>();
                listOfFormTemplateCustom.add(formTemplateCustom);
                formDefinition.setListOfFormTemplateCustom(listOfFormTemplateCustom);

                formTemplateCustom.setFormDefinition(formDefinition);
            } else {
                // If it exist, only change the definition
                formDefinition = formTemplateCustom.getFormDefinition();
                formDefinition.setFdnCode(formTemplateDto.getFdnCode());
                formDefinition.setFdnDefinition(formTemplateDto.getFdnDefinition());
                formDefinition.setModifiedBy(currentUser);

                formTemplateCustom.setModifiedBy(currentUser);
            }

            try {
                formDefinitionRepository.save(formDefinition);
            } catch (Exception e) {
                throw new TechnicalException("Erreur lors de la sauvegarde du form definition pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
            }
        }
    }

    /**
     * Delete the form template custom for the list of user
     * If it exists
     * @param id The id of default form which the custom form are based on
     * @param listUserId the list of user id for which to save the form
     * @param currentUserId Id of the user saving
     */
    public void deleteFormTemplateCustomUser(Long id, List<Long> listUserId, Long currentUserId) {
        // Get the user doing the action
        Users currentUser = userService.getUserById(currentUserId);

        // For each user
        for (Long userId : listUserId) {
            // Check if there is a custom template
            FormTemplateCustom formTemplateCustom = formTemplateCustomRepository.findByFormTemplate_IdAndUser_IdAndDeletedAtIsNull(id, userId).orElse(null);

            // If there is a custom template
            if (formTemplateCustom != null) {
                // Delete the form template custom
                formTemplateCustom.markAsDeleted(currentUser);

                // Delete the associated definition
                FormDefinition formDefinition = formTemplateCustom.getFormDefinition();
                formDefinition.markAsDeleted(currentUser);

                try {
                    formDefinitionRepository.save(formDefinition);
                } catch (Exception e) {
                    throw new TechnicalException("Erreur lors de la sauvegarde du form definition pour l'utilisateur avec l'id  " + userId + ".", e.getMessage());
                }
            }
        }
    }
}
