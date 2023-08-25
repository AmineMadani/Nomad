package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.PermissionDto;
import com.veolia.nextcanope.dto.ProfileDto;
import com.veolia.nextcanope.service.PermissionService;
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
@RequestMapping("/permissions")
@Tag(name = "Permission Management System", description = "Operations pertaining to permission in the Permission Management System")
public class PermissionController {

    @Autowired
    public PermissionService permissionService;

    @GetMapping()
    @Operation(summary = "Get the list of permissions")
	@ApiResponses(value = {
        @ApiResponse(responseCode = "200",description= "The permission list")
    })
    public List<PermissionDto> getAllPermissions() {
        return this.permissionService.getAllPermissions();
    }
}