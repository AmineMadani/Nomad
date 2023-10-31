package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.payload.ExternalSaveWorkorderPayload;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.UserRepository;
import com.veolia.nextcanope.service.WorkorderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import static com.veolia.nextcanope.constants.ConfigConstants.EXTERNAL_MAIL;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/basic/external/exploitation/workorders")
@Tag(name = "Exploitation - WorkOrder Management System for External call", description = "Operations pertaining to workOrder in the WorkOrder Management System for/from External application")
public class ExternalWorkorderController {
    @Autowired
    WorkorderService workOrderService;

    @Autowired
    UserRepository userRepository;

    @PostMapping(path="/updateCompletion")
    @Operation(summary = "Update a workorder completion informations")
    @ApiResponses()
    public void updateWorkOrder(
            @RequestBody ExternalSaveWorkorderPayload workorderDto
    ) {
        Users user = userRepository.findByUsrEmail(EXTERNAL_MAIL).orElse(null);

        this.workOrderService.updateWorkOrderCompletion(
                workorderDto.getId(),
                workorderDto.getCompletionStartDate(),
                workorderDto.getCompletionEndDate(),
                workorderDto.getAgent(),
                user
        );
    }
}
