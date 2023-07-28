package com.veolia.nextcanope.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.WorkorderDto;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.service.WorkorderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/exploitation/workorder")
@Tag(name = "Exploitation - WorkOrder Management System", description = "Operations pertaining to workOrder in the WorkOrder Management System")
public class WorkorderController {

    @Autowired
    public WorkorderService workOrderService;

    @PostMapping(path = "pagination/{limit}/{offset}")
    @Operation(summary = "Get the workorders with search parameter in pagination format")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorders filtered", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<WorkorderDto> getWorkOrders(@PathVariable Long limit, @PathVariable Long offset, @RequestBody(required = false) HashMap<String, String[]> searchParameter) {
        return this.workOrderService.getWorkOrdersWithOffsetOrderByMostRecentDateBegin(limit, offset,searchParameter);
    }
    
    @PostMapping(path = "create")
    @Operation(summary = "Create a workorder")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorder", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public WorkorderDto createWorkOrder(AccountTokenDto account, @RequestBody(required = true) WorkorderDto workorderDto) {
    	return this.workOrderService.createWorkOrder(workorderDto, account);
    }
    
    @PostMapping(path = "update")
    @Operation(summary = "Update a workorder")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorder", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public WorkorderDto updateWorkOrder(AccountTokenDto account, @RequestBody(required = true) WorkorderDto workorderDto) {
    	return this.workOrderService.updateWorkOrder(workorderDto, account);
    }
    
    @GetMapping(path = "/{id}")
    @Operation(summary = "Get a workorder")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorder", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public WorkorderDto getWorkOrderById(@PathVariable Long id) {
    	return this.workOrderService.getWorkOrderDto(id);
    }
}
