package com.veolia.nextcanope.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.WorkOrderDto;
import com.veolia.nextcanope.service.WorkOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/exploitation/intervention")
@Tag(name = "Exploitation - Intervention Management System", description = "Operations pertaining to intervention in the Intervention Management System")
public class InterventionController {

    @Autowired
    public WorkOrderService interventionService;

    @PostMapping(path = "pagination/{limit}/{offset}")
    @Operation(summary = "Get the interventions with search parameter in pagination format")
    @ApiResponses(value = {
    			@ApiResponse(description= "The intervention filtered", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<WorkOrderDto> getInterventions(@PathVariable Long limit, @PathVariable Long offset, @RequestBody(required = false) HashMap<String, String[]> searchParameter) {
        return this.interventionService.getInterventionsWithOffsetOrderByMostRecentDateBegin(limit, offset,searchParameter);
    }
}
