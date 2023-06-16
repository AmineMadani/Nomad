package com.veolia.nextcanope.controller;

import java.util.List;
import java.util.Map;

import com.veolia.nextcanope.dto.LayerReference.LayerReferencesFlatDto;
import com.veolia.nextcanope.dto.LayerReference.SaveLayerReferenceUserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.constants.LayerConstants;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.dto.LayerDto;
import com.veolia.nextcanope.dto.LayerReference.LayerReferencesDto;
import com.veolia.nextcanope.repository.LayerRepository;
import com.veolia.nextcanope.service.LayerReferencesService;
import com.veolia.nextcanope.service.LayerService;

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

    @GetMapping(path = "/references/{type}/layer/{lyrTableName}")
    @Operation(summary = "Get the layer references")
    @ApiResponses(value = {
            @ApiResponse(description= "All layer references with customization", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<LayerReferencesFlatDto> getLayerReferencesWithLyrTableName(@PathVariable String type, @PathVariable String lyrTableName, AccountTokenDto account) throws Exception {
        if (LayerConstants.USER_LAYER_REFERENCE_SEARCH.equals(type)) {
            return this.layerReferencesService.getUserLayerReferencesWithLyrTableName(account.getId(), lyrTableName);
        } else {
            throw new Exception("Get the default references for a specific lyrTableName is not implemented yet.");
        }
    }

    @GetMapping(path = "/default/definitions")
    @Operation(summary = "Get all the layer ")
    @ApiResponses(value = {
            @ApiResponse(description= "All layers description", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<LayerDto> getAllLayers() {
        return  layerService.getLayers();
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

    @PostMapping(path = "/references/user")
    @Operation(summary = "Save the user custom layer references")
    @ApiResponses(value = {
            @ApiResponse(description= "All layer references with customization", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public HttpStatus saveUserLayerReferences(@RequestBody SaveLayerReferenceUserDto saveDto, AccountTokenDto account) throws Exception {
        try {
            this.layerReferencesService.saveUserLayerReferences(saveDto.getLayerReferences(), saveDto.getUserIds(), account.getId());
            return HttpStatus.CREATED;
        } catch (Exception e) {
            throw new Exception("Error during the layer references saving");
        }


    }
}
