package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.workorderTaskReason.WorkorderTaskReasonUpdateDto;
import com.veolia.nextcanope.service.WorkorderTaskReasonService;
import com.veolia.nextcanope.utils.ResponseMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/workorder-task-reason")
@Tag(name = "WorkorderTaskReasonController Management System", description = "Operations pertaining to workorderTaskRaason")
public class WorkorderTaskReasonController {

    @Autowired
    WorkorderTaskReasonService workorderTaskReasonService;

    @PostMapping(path = "create")
    @Operation(summary = "Create a workorder task reason")
    @ApiResponses(value = {
            @ApiResponse(description= "The workorder task reason", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage createWorkorderTaskReason(AccountTokenDto account, @RequestBody WorkorderTaskReasonUpdateDto workorderTaskReasonUpdateDto) {
        workorderTaskReasonService.createWorkorderTaskReason(workorderTaskReasonUpdateDto, account.getId());
        return new ResponseMessage("Le motif a été créé avec succès.");
    }

    @PostMapping(path = "update")
    @Operation(summary = "Update a workorder task reason")
    @ApiResponses(value = {
            @ApiResponse(description= "The workorder task reason", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage updateWorkorderTaskReason(AccountTokenDto account, @RequestBody WorkorderTaskReasonUpdateDto workorderTaskReasonUpdateDto) {
        workorderTaskReasonService.updateWorkorderTaskReason(workorderTaskReasonUpdateDto, account.getId());
        return new ResponseMessage("Le motif a été modifié avec succès.");
    }

}
