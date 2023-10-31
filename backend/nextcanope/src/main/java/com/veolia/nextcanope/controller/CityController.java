package com.veolia.nextcanope.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.CityDto;
import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.service.CityService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

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
            @ApiResponse(responseCode = "200",description= "The city list based on the user configuration")
    })
    public List<CityDto> getCities(AccountTokenDto account) {
        return this.cityService.getAllUserCities(account.getId());
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
