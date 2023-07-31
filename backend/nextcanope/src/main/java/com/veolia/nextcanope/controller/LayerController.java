package com.veolia.nextcanope.controller;

import java.util.List;
import java.util.Map;

import com.veolia.nextcanope.dto.*;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleSummaryDto;
import com.veolia.nextcanope.dto.payload.SaveLayerReferenceUserPayload;
import com.veolia.nextcanope.dto.payload.SaveLayerStylePayload;
import com.veolia.nextcanope.service.LayerStyleService;
import com.veolia.nextcanope.utils.ResponseMessage;
import com.veolia.nextcanope.dto.payload.GetEquipmentsPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.constants.LayerConstants;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.repository.LayerRepository;
import com.veolia.nextcanope.service.LayerReferencesService;
import com.veolia.nextcanope.service.LayerService;
import com.veolia.nextcanope.service.WorkOrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/layer")
@Tag(name = "Layer Management System", description = "Operations pertaining to layer in the Layer Management System")
public class LayerController {

    @Autowired
    public LayerService layerService;

    @Autowired
    public LayerRepository layerRepository;
    
    @Autowired
    public WorkOrderService workOrderService;
    
    @Autowired
    public LayerReferencesService layerReferencesService;

    @Autowired
    public LayerStyleService layerStyleService;

    @GetMapping(path = "/{key}")
    @Operation(summary = "Get the index by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "Indexes of the wanted layer", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getIndexByKey(@PathVariable String key) {
        return this.layerService.getIndexByKey(key);
    }

    @GetMapping(path = "/{key}/{tileNumber}")
    @Operation(summary = "Get the layer tile by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "The layer tile in geojson format", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getLayerTile(
            @PathVariable String key,
            @PathVariable Long tileNumber,
            AccountTokenDto account
    ) {
        return this.layerService.getLayerTile(key, tileNumber, account.getId());
    }

    @GetMapping(path = "/references/{type}")
    @Operation(summary = "Get the layer references")
    @ApiResponses(value = {
        @ApiResponse(description= "All layer references with customization", content =  {
                @Content(schema = @Schema(implementation = String.class))
        })
    })
    public List<LayerReferencesDto> getLayerReferences(@PathVariable String type, AccountTokenDto account) {
        if (LayerConstants.USER_LAYER_REFERENCE_SEARCH.equals(type)) {
            return this.layerReferencesService.getUserLayerReferences(account.getId());
        } else {
            return this.layerReferencesService.getDefaultLayerReferences();
        }
    }

    @GetMapping(path = "/default/definitions")
    @Operation(summary = "Get all the layer ")
    @ApiResponses(value = {
            @ApiResponse(description= "All layers description", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<LayerDto> getAllLayers(AccountTokenDto account) {
        return  layerService.getLayers(account.getId());
    }

    @PostMapping(path = "/equipment")
    @Operation(summary = "Get the equipment by layer and id")
    @ApiResponses(value = {
            @ApiResponse(description= "The equipment", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<Map<String, Object>> getEquipmentsByLayers(@RequestBody List<GetEquipmentsPayload> getEquipmentsPayload) throws Exception {
        try {
            return this.layerService.getEquipmentsByLayersAndIds(getEquipmentsPayload);
        } catch (Exception e) {
            throw new Exception("Error during the layer references saving");
        }
    }
    
    @GetMapping(path = "/{key}/equipment/{id}")
    @Operation(summary = "Get the equipment by layer and id")
    @ApiResponses(value = {
    			@ApiResponse(description= "The equipment", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<Map<String, Object>> getEquipmentByLayerAndId(
            @PathVariable String key,
            @PathVariable String id
    ) {
        return this.layerService.getEquipmentByLayerAndId(key, id);
    }
    
    @GetMapping(path = "/{key}/equipment/{id}/history")
    @Operation(summary = "Get the equipment by layer and id")
    @ApiResponses(value = {
    			@ApiResponse(description= "The equipment", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<WorkorderDto> getEquipmentWorkOrderHistoryByLayerAndId(
            @PathVariable String key,
            @PathVariable String id
    ) {
        return this.workOrderService.getEquipmentWorkOrderHistory(key, id);
    }

    @PostMapping(path = "/references/user")
    @Operation(summary = "Save the user custom layer references. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "All layer references with customization", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage saveUserLayerReferences(@RequestBody SaveLayerReferenceUserPayload saveDto, AccountTokenDto account) {
        this.layerReferencesService.saveUserLayerReferences(saveDto.getLayerReferences(), saveDto.getUserIds(), account.getId());
        return new ResponseMessage("Les données attributaires ont été enregistrées avec succès.");
    }

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
