package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.OrganizationalUnitDto;
import com.veolia.nextcanope.service.OrganizationalUnitService;
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
@RequestMapping("/organizational-units")
@Tag(name = "Organizational unit Management System", description = "Operations pertaining to organizational unit in the Organizational unit Management System")
public class OrganizationalUnitController {

    @Autowired
    public OrganizationalUnitService organizationalUnitService;

    @GetMapping()
    @Operation(summary = "Get the list of organizational unit")
	@ApiResponses(value = {
        @ApiResponse(responseCode = "200",description= "The organizational unit list")
    })
    public List<OrganizationalUnitDto> getAllOrganizationalUnits() {
        return this.organizationalUnitService.getAllOrganizationalUnits();
    }
}
