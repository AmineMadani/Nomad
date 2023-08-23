package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;
import com.veolia.nextcanope.model.FormTemplateCustom;

import java.util.Optional;

public interface FormTemplateCustomRepository extends NomadRepository<FormTemplateCustom, Long> {
    Optional<FormTemplateCustom> findByFormTemplate_IdAndUser_IdAndDeletedAtIsNull(Long ftId, Long userId);
}
