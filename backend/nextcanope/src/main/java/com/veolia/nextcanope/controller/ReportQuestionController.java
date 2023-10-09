package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.ReportQuestionDto;
import com.veolia.nextcanope.service.ReportQuestionService;
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
}
