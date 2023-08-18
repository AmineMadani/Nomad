package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.ProfileDto;
import com.veolia.nextcanope.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/profiles")
@Tag(name = "Profile Management System", description = "Operations pertaining to profile in the Profile Management System")
public class ProfileController {

    @Autowired
    public ProfileService profileService;

    @GetMapping()
    @Operation(summary = "Get the list of organizational unit")
	@ApiResponses(value = {
        @ApiResponse(responseCode = "200",description= "The profile list")
    })
    public List<ProfileDto> getAllProfiles() {
        return this.profileService.getAllProfiles();
    }
}
