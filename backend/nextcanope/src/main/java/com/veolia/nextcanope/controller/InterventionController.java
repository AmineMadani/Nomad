package com.veolia.nextcanope.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.InterventionDto;
import com.veolia.nextcanope.service.InterventionService;

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
    public InterventionService interventionService;

    @GetMapping(path = "pagination/{limit}/{offset}")
    @Operation(summary = "Get the layer tile by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "The layer tile in geojson format", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<InterventionDto> getLayerTile(@PathVariable Long limit, @PathVariable Long offset) {
        return this.interventionService.getInterventionsWithOffsetOrderByMostRecentDateBegin(limit, offset);
    }
}
