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
import java.util.*; 


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/basic/external/exploitation")
@Tag(name = "Exploitation - Tasks for External call", description = "tasks Management for/from External application")
public class ExternalTaskController {

    @Autowired
    DDTaskRepository  dDTaskRepository;

    @GetMapping(path = "task/list", produces = "application/json")
    @Operation(summary = "Get a list of tasks according to the filter")
    @ApiResponses(value = {
    			@ApiResponse(description= "@PathVariable String modificationDateRef,", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getTasks(
            @RequestParam(name ="modificationDateRef", required=true) String modificationDateRef,
            @RequestParam(name ="contractsList", required=false) String contractsList,
            @RequestParam(name ="statusList", required=false) String statusList
    ) {
        String resp =  this.dDTaskRepository.getTasks(modificationDateRef,contractsList,statusList);
        if (resp == null) {
            return "[]";
        } 
         return resp;
    }



    @GetMapping(path = "task/report", produces = "application/json")
    @Operation(summary = "Get the report of a task")
    @ApiResponses(value = {
    			@ApiResponse(description= "@PathVariable String taskId,", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getReportByTaskId(
            @RequestParam(name ="taskId", required=true) Long taskId
    ) {
        String resp = this.dDTaskRepository.getReportByTaskId(taskId);
        if (resp == null) {
            return "[]";
        } 
         return resp;
    }

}
