package com.veolia.externalVeoliaApi.controller;

import com.veolia.externalVeoliaApi.dto.attachment.AttachmentDto;
import com.veolia.externalVeoliaApi.exception.FunctionalException;
import com.veolia.externalVeoliaApi.exception.TechnicalException;
import com.veolia.externalVeoliaApi.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotNull;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@Tag(name = "Attachments manager", description = "All actions pertaining to attachments")
public class AttachmentController {

    @Autowired
    AttachmentService attachmentService;

    @GetMapping(path = "/attachment/workorder/{nomadId}")
    @Operation(summary = "Get the list of attachment of a given id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The list of attachments for the workorder id")
    })
    public List<AttachmentDto> getListAttachmentForWorkorder(
            @PathVariable @NotNull Long nomadId
    ) {
        try {
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("key", "nomad_id");
            jsonObj.put("operator", "equal");
            jsonObj.put("value", nomadId);

            return attachmentService.getListAttachment(jsonObj);
        } catch (FunctionalException e) {
            throw e;
        } catch (Exception e) {
            throw new TechnicalException(e.getMessage());
        }
    }

    @GetMapping(path = "/attachment/itv/{itvId}")
    @Operation(summary = "Get the list of attachment of a given id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The list of attachments for the ITV id")
    })
    public List<AttachmentDto> getListAttachmentForItv(
            @PathVariable @NotNull Long itvId
    ) {
        try {
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("key", "nomad_itv_id");
            jsonObj.put("operator", "equal");
            jsonObj.put("value", itvId);

            return attachmentService.getListAttachment(jsonObj);
        } catch (FunctionalException e) {
            throw e;
        } catch (Exception e) {
            throw new TechnicalException(e.getMessage());
        }
    }

    @GetMapping(path = "/attachment/{id}")
    @Operation(summary = "Get the attachement for a given id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The attachment for the id")
    })
    public AttachmentDto getAttachmentById(
            @PathVariable @NotNull String id
    ) {
        try {
            return attachmentService.getAttachmentById(id);
        } catch (FunctionalException e) {
            throw e;
        } catch (Exception e) {
            throw new TechnicalException(e.getMessage());
        }
    }

    @PostMapping(path = "/attachment/workorder/{nomadId}")
    @Operation(summary = "Create an attachement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The attachment for the workorder id")
    })
    public AttachmentDto createAttachmentForWorkOrder(
            @PathVariable @NotNull Long nomadId,
            @RequestBody MultipartFile file
    ) {
        try {
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("nomad_id", nomadId);
            return attachmentService.createAttachment(jsonObj, file);
        } catch (FunctionalException e) {
            throw e;
        } catch (Exception e) {
            throw new TechnicalException(e.getMessage());
        }
    }

    @PostMapping(path = "/attachment/itv/{itvId}")
    @Operation(summary = "Create an attachement")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200",description= "The attachment for the ITV id")
    })
    public AttachmentDto createAttachmentForItv(
            @PathVariable @NotNull Long itvId,
            @RequestBody MultipartFile file
    ) {
        try {
            JSONObject jsonObj = new JSONObject();
            jsonObj.put("nomad_itv_id", itvId);
            return attachmentService.createAttachment(jsonObj, file);
        } catch (FunctionalException e) {
            throw e;
        } catch (Exception e) {
            throw new TechnicalException(e.getMessage());
        }
    }
}
