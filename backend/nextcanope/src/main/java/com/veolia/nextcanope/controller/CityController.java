package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.dto.Contract.ContractDto;
import com.veolia.nextcanope.service.CityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/cities")
@Tag(name = "City Management System", description = "Operations pertaining to contract in the City Management System")
public class CityController {

    @Autowired
    public CityService cityService;

    @GetMapping()
    @Operation(summary = "Get the list of city")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The contract list")
    })
    public List<CityDto> getCities() {
        return this.cityService.getAllCities();
    }

    @GetMapping(path = "/coordinates")
    @Operation(summary = "Get the list of city id by latitude and longitude")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200",description= "The city id list")
    })
    public List<Long> getCityIdsByLatitudeLongitude(
        @RequestParam Double latitude,
        @RequestParam Double longitude
    ) {
        return this.cityService.getCityIdsByLatitudeLongitude(latitude, longitude);
    }
}
