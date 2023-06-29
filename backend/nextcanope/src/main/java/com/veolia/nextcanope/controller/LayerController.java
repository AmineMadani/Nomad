package com.veolia.nextcanope.controller;

import java.util.List;
import java.util.Map;

import com.veolia.nextcanope.dto.LayerReference.SaveLayerReferenceUserDto;
import com.veolia.nextcanope.utils.ResponseMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.constants.LayerConstants;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.LayerDto;
import com.veolia.nextcanope.dto.TreeDto;
import com.veolia.nextcanope.dto.WorkorderDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.repository.LayerRepository;
import com.veolia.nextcanope.service.LayerReferencesService;
import com.veolia.nextcanope.service.LayerService;
import com.veolia.nextcanope.service.TreeService;
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
    TreeService treeService;

    @Autowired
    public LayerRepository layerRepository;
    
    @Autowired
    public WorkOrderService workOrderService;
    
    @Autowired
    public LayerReferencesService layerReferencesService;

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
    
    @GetMapping(path = "/{key}/equipment/{id}")
    @Operation(summary = "Get the equipment by layer and id")
    @ApiResponses(value = {
    			@ApiResponse(description= "The equipment", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public List<Map<String, Object>> getEquipmentByLayerAndId(
            @PathVariable String key,
            @PathVariable String id,
            AccountTokenDto account
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
            @PathVariable String id,
            AccountTokenDto account
    ) {
        return this.workOrderService.getEquipmentWorkorderHistory(key, id);
    }

    @PostMapping(path = "/references/user")
    @Operation(summary = "Save the user custom layer references. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "All layer references with customization", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage saveUserLayerReferences(@RequestBody SaveLayerReferenceUserDto saveDto, AccountTokenDto account) {
        this.layerReferencesService.saveUserLayerReferences(saveDto.getLayerReferences(), saveDto.getUserIds(), account.getId());
        return new ResponseMessage("Les données attributaires ont été enregistrées avec succès.");
    }
    
    @GetMapping(path = "/tree")
    @Operation(summary = "Get default tree layers")
    @ApiResponses(value = {
            @ApiResponse(description= "The default tree", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<TreeDto> getDefaultTree(){
        return treeService.getTree();
    }
}
