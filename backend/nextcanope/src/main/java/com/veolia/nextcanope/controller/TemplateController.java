package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.dto.FormTemplate.FormTemplateUpdateDto;
import com.veolia.nextcanope.model.FormTemplate;
import com.veolia.nextcanope.service.FormTemplateService;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.FormTemplateDto;
import com.veolia.nextcanope.repository.FormTemplateRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/template")
@Tag(name = "Template Management System", description = "Operations pertaining to template in the template Management System")
public class TemplateController {
	
	@Autowired
	FormTemplateRepository formTemplateRepository;

	@Autowired
	FormTemplateService formTemplateService;
		
	@GetMapping(path = "/forms")
	@Operation(summary = "Get the forms template")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "List of form template")
			})
	public List<FormTemplateDto> getFormsTemplate(AccountTokenDto account) {
		return formTemplateRepository.getFormsTemplate(account.getId());
	}

	@PostMapping(path = "create")
	@Operation(summary = "Create a form")
	@ApiResponses(value = {
			@ApiResponse(description= "The form", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public Long createFormTemplate(AccountTokenDto account, @RequestBody FormTemplateUpdateDto formTemplateDto) {
		return formTemplateService.createFormTemplate(formTemplateDto, account.getId());
	}

	@PutMapping(path = "update")
	@Operation(summary = "Update a form")
	@ApiResponses(value = {
			@ApiResponse(description= "The form", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public Long updateFormTemplate(AccountTokenDto account, @RequestBody FormTemplateUpdateDto formTemplateDto) {
		return formTemplateService.updateFormTemplate(formTemplateDto, account.getId());
	}
}
