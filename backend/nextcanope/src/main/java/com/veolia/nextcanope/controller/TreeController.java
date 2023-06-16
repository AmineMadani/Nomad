package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.TreeDto;
import com.veolia.nextcanope.service.TreeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/tree")
@Tag(name = "Tree Management System", description = "Operations pertaining to tree in the Tree Management System")
public class TreeController
{

    @Autowired
    TreeService treeService;


    @GetMapping(path = "/default")
    @Operation(summary = "Get Default definition")
    @ApiResponses(value = {
            @ApiResponse(description= "The default tree", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<TreeDto> getDefaultTree(){
        return treeService.getTree();
    }
}
