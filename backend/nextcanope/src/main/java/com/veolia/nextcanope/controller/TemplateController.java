package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.dto.FormTemplate.FormTemplateUpdateDto;
import com.veolia.nextcanope.dto.payload.DeleteFormTemplateCustomUserPayload;
import com.veolia.nextcanope.dto.payload.SaveFormTemplateCustomUserPayload;
import com.veolia.nextcanope.service.FormTemplateService;
import com.veolia.nextcanope.utils.ResponseMessage;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.dto.account.AccountTokenDto;
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

	@PostMapping(path = "custom/user")
	@Operation(summary = "Save the user custom form template for a list of user id. Return a response message.")
	@ApiResponses(value = {
			@ApiResponse(description= "The form", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public ResponseMessage saveFormTemplateCustomUser(AccountTokenDto account, @RequestBody SaveFormTemplateCustomUserPayload saveFormTemplateCustomUserPayload) {
		formTemplateService.saveFormTemplateCustomUser(
				saveFormTemplateCustomUserPayload.getFormTemplate(),
				saveFormTemplateCustomUserPayload.getUserIds(),
				account.getId()
		);
		return new ResponseMessage("La customisation a été enregistrée avec succès.");
	}

	@PostMapping(path = "custom/delete/user")
	@Operation(summary = "Delete the user custom form template for a list of user id. Return a response message.")
	@ApiResponses(value = {
			@ApiResponse(description= "The form", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public ResponseMessage deleteormTemplateCustomUser(AccountTokenDto account, @RequestBody DeleteFormTemplateCustomUserPayload deleteFormTemplateCustomUserPayload) {
		formTemplateService.deleteFormTemplateCustomUser(
				deleteFormTemplateCustomUserPayload.getId(),
				deleteFormTemplateCustomUserPayload.getUserIds(),
				account.getId()
		);
		return new ResponseMessage("La customisation a été supprimée avec succès.");
	}
}
