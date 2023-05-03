package com.veolia.nextcanope.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.repository.ReferentialRepositoryImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/referential")
@Tag(name = "Referential Management System", description = "Operations pertaining to referential in the Referential Management System")
public class ReferentialController {
	
	@Autowired
	ReferentialRepositoryImpl referentialRepositoryImpl;
		
	@GetMapping(path = "/{key}")
	@Operation(summary = "Get the referential")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "List data from the referential")
			})
	public List<Map<String, Object>> getReferential(@PathVariable String key) {
		return referentialRepositoryImpl.getReferentialData(key);
	}
}
