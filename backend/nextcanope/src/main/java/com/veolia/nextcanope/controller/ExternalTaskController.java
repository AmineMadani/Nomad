package com.veolia.nextcanope.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.veolia.nextcanope.repository.DDTaskRepository;
import static com.veolia.nextcanope.constants.ConfigConstants.EXTERNAL_MAIL;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/basic/external/exploitation")
@Tag(name = "Exploitation - Tasks for External call", description = "Operations pertaining to workOrder in the WorkOrder Management System for/from External application")
public class ExternalTaskController {

    @Autowired
    DDTaskRepository  dDTaskRepository;


    @GetMapping(path = "/DDtasks")
    @Operation(summary = "Get a list of tasks according to the filter")
    @ApiResponses(value = {
    			@ApiResponse(description= "@PathVariable String modificationDateRef,", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getTasksForDD(
            @RequestParam(name ="modificationDateRef", required=true) String modificationDateRef,
            @RequestParam(name ="contractsList", required=true) String contractsList,
            @RequestParam(name ="statusList", required=false) String statusList
    ) {
        return this.dDTaskRepository.getTasksForDD(modificationDateRef,contractsList,statusList);
    }



    @GetMapping(path = "/DDreport")
    @Operation(summary = "Get the report of a task")
    @ApiResponses(value = {
    			@ApiResponse(description= "@PathVariable String taskId,", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getReportByTaskIdForDD(
            @RequestParam(name ="taskId", required=true) Long taskId
    ) {
        return this.dDTaskRepository.getReportByTaskId(taskId);
    }

}
