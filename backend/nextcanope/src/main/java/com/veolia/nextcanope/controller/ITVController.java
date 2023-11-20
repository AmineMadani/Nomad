package com.veolia.nextcanope.controller;

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

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/itv")
@Tag(name = "ITV", description = "Operations pertaining to ITV")
public class ITVController {
    @Autowired
    ITVService itvService;

    @PostMapping(path = "import")
    @Operation(summary = "Import an ITV file")
    @ApiResponses(value = {
            @ApiResponse(description= "The itv file", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public void importItv(@RequestParam("file") MultipartFile file) throws IOException {
        itvService.readFile(file);
    }
}
