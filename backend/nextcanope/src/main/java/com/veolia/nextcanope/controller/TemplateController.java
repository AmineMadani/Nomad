package com.veolia.nextcanope.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
		
	@GetMapping(path = "/forms")
	@Operation(summary = "Get the forms template")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "List of form template")
			})
	public List<FormTemplateDto> getFormsTemplate(AccountTokenDto account) {
		return formTemplateRepository.getFormsTemplate(account.getId());
	}
}
