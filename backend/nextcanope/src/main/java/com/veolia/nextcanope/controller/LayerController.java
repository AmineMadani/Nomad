package com.veolia.nextcanope.controller;

import java.util.LinkedHashMap;
import java.util.List;

import com.veolia.nextcanope.dto.LayerGrpActionDTO;
import com.veolia.nextcanope.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.constants.LayerConstants;
import com.veolia.nextcanope.dto.LayerWithStylesDto;
import com.veolia.nextcanope.dto.VLayerWtrDto;
import com.veolia.nextcanope.dto.WorkorderDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleDetailDto;
import com.veolia.nextcanope.dto.LayerStyle.LayerStyleSummaryDto;
import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.payload.GetEquipmentsPayload;
import com.veolia.nextcanope.dto.payload.GetTilePayload;
import com.veolia.nextcanope.dto.payload.SaveLayerReferenceUserPayload;
import com.veolia.nextcanope.dto.payload.SaveLayerStylePayload;
import com.veolia.nextcanope.repository.LayerRepository;
import com.veolia.nextcanope.utils.ResponseMessage;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/layers")
@Tag(name = "Layer Management System", description = "Operations pertaining to layer in the Layer Management System")
public class LayerController {

    @Autowired
    public LayerService layerService;

    @Autowired
    public LayerRepository layerRepository;
    
    @Autowired
    public WorkorderService workOrderService;
    
    @Autowired
    public LayerReferencesService layerReferencesService;

    @Autowired
    public LayerStyleService layerStyleService;

    @GetMapping(path = "/indexes")
    @Operation(summary = "Get the indexes of the current user.")
    @ApiResponses(value = {
    			@ApiResponse(description= "Indexes of the current user", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getIndexByKey(AccountTokenDto account) {
        return this.layerService.getIndexByKey(account.getId());
    }

    @PostMapping(path = "/{key}/{tileNumber}")
    @Operation(summary = "Get the layer tile by key")
    @ApiResponses(value = {
    			@ApiResponse(description= "The layer tile in geojson format", content =  {
    						@Content(schema = @Schema(implementation = String.class))
    					})
    			})
    public String getLayerTile(
            @PathVariable String key,
            @PathVariable Long tileNumber,
            @RequestBody GetTilePayload getTilePayload,
            AccountTokenDto account
    ) {
        return this.layerService.getLayerTile(key, tileNumber,getTilePayload.getStartDate(), account.getId());
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

    @GetMapping(path = "/defaults/definitions")
    @Operation(summary = "Get all the layer ")
    @ApiResponses(value = {
            @ApiResponse(description= "All layers description", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<LayerWithStylesDto> getAllLayerDefinitions(AccountTokenDto account) {
        return  layerService.getLayerDefinitions(account.getId());
    }

    @PostMapping(path = "/equipments")
    @Operation(summary = "Get the equipment by layer and id")
    @ApiResponses(value = {
            @ApiResponse(description= "The equipment", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public String getEquipmentsByLayers(@RequestBody List<GetEquipmentsPayload> getEquipmentsPayload,AccountTokenDto account) throws Exception {
        try {
            return this.layerService.getAssetByLayerAndIds(getEquipmentsPayload, account.getId());
        } catch (Exception e) {
            throw new Exception("Error during the layer references recuperation");
        }
    }
    
    @GetMapping(path = "/{key}/equipments/{id}/history")
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

    @PostMapping(path = "/references/users/save")
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

    @PostMapping(path = "/{lyrId}/styles/create")
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

    @PutMapping(path = "/styles/{lseId}/update")
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

    @DeleteMapping(path = "/styles/delete")
    @Operation(summary = "Delete a list of layer styles. Return a response message.")
    @ApiResponses(value = {
            @ApiResponse(description= "A response message", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public ResponseMessage deleteLayerStyles(
            @RequestParam List<Long> lseIds,
            AccountTokenDto account
    ) {
        this.layerStyleService.deleteLayerStyles(lseIds, account.getId());
        return new ResponseMessage("Les styles de couche ont été supprimés avec succès.");
    }

    @GetMapping(path = "/v-layer-wtr")
    @Operation(summary = "Get the result of the v_layer_wtr")
    @ApiResponses(value = {
            @ApiResponse(description= "Get all v_layer_wtr", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<VLayerWtrDto> getVLayerWtr() {
        return this.layerService.getAllVLayerWtr();
    }


    @GetMapping(path = "/search/{partialId}")
    @Operation(summary = "Search an asset by partial id")
    @ApiResponses(value = {
            @ApiResponse(description= "Search Asset by partial id", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public String getAssetFromPartialId(@PathVariable String partialId, AccountTokenDto account) {
        return this.layerService.getAssetFromPartialId(partialId, account.getId());
    }

    @GetMapping(path = "/groups")
    @Operation(summary = "Get the groups of layers by action")
    @ApiResponses(value = {
            @ApiResponse(description= "Get all lyr_grp_action", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<LayerGrpActionDTO> getLayerGroupActions() {
        return this.layerService.getAllLayerGroups();
    }

    @GetMapping(path = "/asset-ids/by-filters")
    @Operation(summary = "Get assets from filters")
    @ApiResponses(value = {
        @ApiResponse(description= "All asset id with the layer key associated", content =  {
                @Content(schema = @Schema(implementation = String.class))
        })
    })
    public List<LinkedHashMap<String, Object>> getAssetIdsByLayersAndFilterId(
        @RequestParam List<String> layerKeys,
        @RequestParam List<Long> filterIds,
        @RequestParam String filterType
    ) {
        return this.layerService.getAssetIdsByLayersAndFilterId(layerKeys, filterIds, filterType);
    }
}
