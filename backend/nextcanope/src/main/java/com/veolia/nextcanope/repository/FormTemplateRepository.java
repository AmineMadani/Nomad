package com.veolia.nextcanope.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.veolia.nextcanope.dto.FormTemplateDto;
import com.veolia.nextcanope.model.FormTemplate;

/**
 * FormTemplate is an interface for managing Form template entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface FormTemplateRepository extends JpaRepository<FormTemplate, Long> {

	/**
     * Get the list of layer references for a specific user.
     * It merges the default list of layer references with the user's list of layer references.
     * @param userId the user id.
     * @return the list of layer references.
     */
    @Query(
            value = "select fte_code as formCode, COALESCE(fd2.fdn_definition, fd.fdn_definition) as definition from nomad.form_template ft  "
            		+ "join nomad.form_definition fd on fd.id=ft.fdn_id  "
            		+ "left join nomad.form_template_custom ftc on ft.id=ftc.fte_id "
            		+ "left join nomad.form_definition fd2 on fd2.id=ftc.fdn_id and ftc.usr_id=:userId "
            		+ "",
            nativeQuery = true
    )
    List<FormTemplateDto> getFormsTemplate(@Param("userId") Long userId);
    
}
