package com.veolia.nextcanope.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.service.PatrimonyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/patrimony")
@Tag(name = "Patrimony Management System", description = "Operations pertaining to patrimony in the Patrimony Management System")
public class PatrimonyController {

    @Autowired
    public PatrimonyService patrimonyService;

    @GetMapping(path = "/{key}")
    @Operation(summary = "Get the index by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "Indexes of the wanted layer", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getIndexByKey(@PathVariable String key) {
        return this.patrimonyService.getIndexByKey(key);
    }

    @GetMapping(path = "/{key}/{tileNumber}")
    @Operation(summary = "Get the equipement tile by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "The equipment tile in geojson format", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getEquipmentTile(@PathVariable String key, @PathVariable Long tileNumber) {
        return this.patrimonyService.getEquipmentTile(key, tileNumber);
    }
}
