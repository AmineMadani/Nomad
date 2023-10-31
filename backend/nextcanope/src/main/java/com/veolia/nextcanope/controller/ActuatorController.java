package com.veolia.nextcanope.controller;

import java.util.HashMap;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.constants.MessageConstants;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Actuator Management System", description = "Operations pertaining to actuator in the Actuator Management System")
public class ActuatorController {

	@GetMapping(path = "/health")
	@Operation(summary = "Get the health of difference parts of the server")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "The status list")
			})
	public HashMap<String, Object> health() {
		HashMap<String, Object> map = new HashMap<>();
		map.put(MessageConstants.LABEL_SERVER_STATUS, MessageConstants.LABEL_STATUS_UP);
		map.put(MessageConstants.LABEL_BDD_STATUS, MessageConstants.LABEL_STATUS_UP);
		return map;
	}
}
