package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.assetForSig.AssetForSigUpdateDto;
import com.veolia.nextcanope.service.AssetForSigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/asset-for-sig")
@Tag(name = "Tempory asset to be handle by SIG", description = "Operations pertaining to tempory asset")
public class AssetForSigController {
    @Autowired
    AssetForSigService assetForSigService;

    @PostMapping(path = "create")
    @Operation(summary = "Create a asset for sig")
    @ApiResponses(value = {
            @ApiResponse(description= "The asset for sig", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public Long createAssetForSig(AccountTokenDto account, @RequestBody AssetForSigUpdateDto assetForSigUpdateDto) {
        return assetForSigService.createAssetForSig(assetForSigUpdateDto, account.getId());
    }
}
