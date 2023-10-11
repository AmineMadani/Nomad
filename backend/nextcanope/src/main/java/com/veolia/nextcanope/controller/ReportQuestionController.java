package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.ReportQuestionDto;
import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.reportQuestion.ReportQuestionUpdateDto;
import com.veolia.nextcanope.service.ReportQuestionService;
import com.veolia.nextcanope.utils.ResponseMessage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/report-question")
@Tag(name = "Report question Management System", description = "Operations pertaining to report question")
public class ReportQuestionController {
    @Autowired
    ReportQuestionService reportQuestionService;

    @GetMapping()
    @Operation(summary = "Get the list of report question")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The report question list")
    })
    public List<ReportQuestionDto> getListReportQuestion() {
        return this.reportQuestionService.getListReportQuestion();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a report question")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The report question")
    })
    public ReportQuestionDto getReportQuestionById(@PathVariable Long id) {
        return reportQuestionService.getReportQuestionById(id);
    }

    @PostMapping(path = "create")
    @Operation(summary = "Create a report question")
    @ApiResponses(value = {
            @ApiResponse(description= "The report question", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage createReportQuestion(AccountTokenDto account, @RequestBody ReportQuestionUpdateDto reportQuestionUpdateDto) {
        reportQuestionService.createReportQuestion(reportQuestionUpdateDto, account.getId());
        return new ResponseMessage("La question a été créé avec succès.");
    }

    @PutMapping(path = "update")
    @Operation(summary = "Update a report question")
    @ApiResponses(value = {
            @ApiResponse(description= "The report question", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage updateReportQuestion(AccountTokenDto account, @RequestBody ReportQuestionUpdateDto reportQuestionUpdateDto) {
        reportQuestionService.updateReportQuestion(reportQuestionUpdateDto, account.getId());
        return new ResponseMessage("La question a été modifié avec succès.");
    }

    @DeleteMapping(path = "delete")
    @Operation(summary = "Delete a report question")
    @ApiResponses(value = {
            @ApiResponse(description= "The report question", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage deleteReportQuestion(AccountTokenDto account, @RequestParam List<Long> id) {
        reportQuestionService.deleteListReportQuestion(id, account.getId());
        return new ResponseMessage("Le(s) question(s) a été supprimé(s) avec succès.");
    }
}
