package com.veolia.nextcanope.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.service.BasemapsService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/basemaps")
@Tag(name = "Basemap Management System", description = "Operations pertaining to base map in the BaseMap Management System")
public class BasemapsController {

    @Autowired
    public BasemapsService basemapsService;

    @GetMapping(path = "/all")
    @Operation(summary = "Get the list of basemap")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "The basemap list")
			})
    public List<Basemaps> getBasemaps() {
        return this.basemapsService.getVisibleBasemaps();
    }
}
