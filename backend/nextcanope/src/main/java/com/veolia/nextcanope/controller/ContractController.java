package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.Contract.ContractOrgDto;
import com.veolia.nextcanope.service.ContractService;
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
@RequestMapping("/contracts")
@Tag(name = "Contract Management System", description = "Operations pertaining to contract in the Contract Management System")
public class ContractController {

    @Autowired
    public ContractService contractService;

    @GetMapping()
    @Operation(summary = "Get the list of contract with organizational units associated")
	@ApiResponses(value = {
        @ApiResponse(responseCode = "200",description= "The contract list")
    })
    public List<ContractOrgDto> getAllContractsWithOrganizationalUnits() {
        return this.contractService.getAllContractsWithOrganizationalUnits();
    }
}
