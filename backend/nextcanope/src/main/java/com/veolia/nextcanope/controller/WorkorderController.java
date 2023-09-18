package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.dto.WorkorderTaskReasonDto;
import com.veolia.nextcanope.dto.WorkorderTaskStatusDto;
import com.veolia.nextcanope.dto.payload.SearchTaskPayload;
import com.veolia.nextcanope.service.WorkorderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.TaskSearchDto;
import com.veolia.nextcanope.dto.payload.CancelWorkorderPayload;
import com.veolia.nextcanope.dto.WorkorderDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/exploitation/workorders")
@Tag(name = "Exploitation - WorkOrder Management System", description = "Operations pertaining to workOrder in the WorkOrder Management System")
public class WorkorderController {

    @Autowired
    public WorkorderService workOrderService;

    @PostMapping(path = "/task/pagination/{limit}/{offset}")
    @Operation(summary = "Get the workorders with search parameter in pagination format")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorders filtered", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<TaskSearchDto> getWorkOrders(@PathVariable Long limit, @PathVariable Long offset, @RequestBody(required = false) SearchTaskPayload searchParameter, AccountTokenDto account) {
        return this.workOrderService.getWorkOrdersWithOffsetOrderByMostRecentDateBegin(limit, offset, searchParameter, account.getId());
    }

    @GetMapping(path = "/{id}")
    @Operation(summary = "Get a workorder")
    @ApiResponses(value = {
        @ApiResponse(description= "The workorder", content =  {
            @Content(schema = @Schema(implementation = String.class))
        })
    })
    public WorkorderDto getWorkOrderById(@PathVariable Long id) {
        return this.workOrderService.getWorkOrderDtoById(id);
    }
    
    @PostMapping(path = "create")
    @Operation(summary = "Create a workorder")
    @ApiResponses(value = {
        @ApiResponse(description= "The workorder", content =  {
            @Content(schema = @Schema(implementation = String.class))
        })
    })
    public WorkorderDto createWorkOrder(AccountTokenDto account, @RequestBody WorkorderDto workorderDto) {
    	return this.workOrderService.createWorkOrder(workorderDto, account.getId());
    }

    @PutMapping(path="/{wkoId}/update")
    @Operation(summary = "Update a workorder")
    @ApiResponses(value = {
        @ApiResponse(description= "The workorder", content =  {
            @Content(schema = @Schema(implementation = String.class))
        })
    })
    public WorkorderDto updateWorkOrder(
        @PathVariable Long wkoId,
        @RequestBody WorkorderDto workorderDto,
        AccountTokenDto account
    ) {
        return this.workOrderService.updateWorkOrder(
                wkoId,
                workorderDto,
                account.getId()
        );
    }

    @PutMapping(path = "/{wkoId}/terminate")
    @Operation(summary = "Terminate a workorder")
    @ApiResponses(value = {
    			@ApiResponse(description= "The workorder", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public WorkorderDto terminateWorkOrder(
        @PathVariable Long wkoId,
        @RequestBody WorkorderDto workorderDto,
        AccountTokenDto account
    ) {
    	return this.workOrderService.terminateWorkOrder(
                wkoId,
                workorderDto,
                account.getId()
        );
    }

    @PutMapping(path = "/{wkoId}/cancel")
    @Operation(summary = "Cancel a workorder")
    @ApiResponses(value = {
            @ApiResponse(description= "The workorder", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public WorkorderDto cancelWorkOrder(
        @PathVariable Long wkoId,
        @RequestBody CancelWorkorderPayload cancelWorkorderPayload,
        AccountTokenDto account
    ) {
        return this.workOrderService.cancelWorkOrder(
                wkoId,
                cancelWorkorderPayload,
                account.getId()
        );
    }

    @GetMapping(path = "tasks/status")
    @Operation(summary = "Get all workorders task status")
    @ApiResponses(value = {
        @ApiResponse(description= "The workorders task status", content =  {
                @Content(schema = @Schema(implementation = String.class))
        })
    })
    public List<WorkorderTaskStatusDto> getAllWorkorderTaskStatus() {
        return this.workOrderService.getAllWorkorderTaskStatus();
    }

    @GetMapping(path = "tasks/reasons")
    @Operation(summary = "Get all workorders task reasons")
    @ApiResponses(value = {
        @ApiResponse(description= "The workorders task reasons", content =  {
            @Content(schema = @Schema(implementation = String.class))
        })
    })
    public List<WorkorderTaskReasonDto> getAllWorkorderTaskReasons() {
        return this.workOrderService.getAllWorkorderTaskReasons();
    }
}
