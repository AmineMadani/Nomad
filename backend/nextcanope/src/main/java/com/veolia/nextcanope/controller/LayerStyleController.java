package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleSummaryDto;
import com.veolia.nextcanope.dto.payload.SaveLayerStylePayload;
import com.veolia.nextcanope.service.LayerStyleService;
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
@RequestMapping("/layer")
@Tag(name = "Layer Style Management System", description = "Operations pertaining to layer style in the Layer Management System")
public class LayerStyleController {

    @Autowired
    public LayerStyleService layerStyleService;

    @GetMapping(path = "/styles")
    @Operation(summary = "Get all layer styles by layer id")
    @ApiResponses(value = {
        @ApiResponse(description= "The list of layer styles", content =  {
                @Content(schema = @Schema(implementation = String.class))
        })
    })
    public List<LayerStyleSummaryDto> getStylesByLayerId() {
        return this.layerStyleService.getAllLayerStyleSummary();
    }

    @GetMapping(path = "/styles/{id}")
    @Operation(summary = "Get a layer style by id")
    @ApiResponses(value = {
            @ApiResponse(description= "A layer style", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public LayerStyleDetailDto getLayerStyleById(@PathVariable Long id) {
        return this.layerStyleService.getLayerStyleDetailById(id);
    }

    @PostMapping(path = "/{lyrId}/styles")
    @Operation(summary = "Create the layer style. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "A response message", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage createLayerStyle(
            @PathVariable Long lyrId,
            @RequestBody SaveLayerStylePayload createPayload, AccountTokenDto account
    ) {
        this.layerStyleService.createLayerStyle(createPayload, lyrId, account.getId());
        return new ResponseMessage("Les styles de couche ont été enregistrés avec succès.");
    }

    @PutMapping(path = "/styles/{lseId}")
    @Operation(summary = "Update the layer styles. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "A response message", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage updateLayerStyle(
            @PathVariable Long lseId,
            @RequestBody SaveLayerStylePayload updatePayload,
            AccountTokenDto account
    ) {
        this.layerStyleService.updateLayerStyle(updatePayload, lseId, account.getId());
        return new ResponseMessage("Les styles de couche ont été enregistrés avec succès.");
    }

    @DeleteMapping(path = "/styles/{lseId}")
    @Operation(summary = "Delete the layer styles. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "A response message", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage deleteLayerStyle(
            @PathVariable Long lseId,
            AccountTokenDto account
    ) {
        this.layerStyleService.deleteLayerStyle(lseId, account.getId());
        return new ResponseMessage("Les styles de couche ont été supprimés avec succès.");
    }
}
