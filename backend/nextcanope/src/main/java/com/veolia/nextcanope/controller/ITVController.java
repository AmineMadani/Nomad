package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.itv.ItvPictureDto;
import com.veolia.nextcanope.repository.ItvPictureRepository;
import com.veolia.nextcanope.service.ITVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/itv")
@Tag(name = "ITV", description = "Operations pertaining to ITV")
public class ITVController {
    @Autowired
    ITVService itvService;

    @Autowired
    ItvPictureRepository itvPictureRepository;

    @PostMapping(path = "import")
    @Operation(summary = "Import an ITV file")
    @ApiResponses(value = {
            @ApiResponse(description= "The itv file", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public Long importItv(@RequestParam("file") MultipartFile file, AccountTokenDto account) throws IOException {
        return itvService.importItv(file, account.getId());
    }

    @GetMapping(path = "/{itvId}/picture")
    @Operation(summary = "Get the list of picture linked to an ITV")
    public List<ItvPictureDto> getListItvPictureByItvId(@PathVariable Long itvId) {
        return itvPictureRepository.getListItvPictureByItvId(itvId);
    }
}
