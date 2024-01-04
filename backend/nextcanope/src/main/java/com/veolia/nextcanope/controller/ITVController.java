package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.dto.TaskSearchDto;
import com.veolia.nextcanope.dto.account.AccountTokenDto;
import com.veolia.nextcanope.dto.itv.*;
import com.veolia.nextcanope.repository.ItvPictureRepository;
import com.veolia.nextcanope.repository.ItvRepository;
import com.veolia.nextcanope.repository.WorkorderRepository;
import com.veolia.nextcanope.service.ITVService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
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

    @Autowired
    ItvRepository itvRepository;

    @Autowired
    WorkorderRepository workorderRepository;

    @PostMapping(path = "/pagination/{limit}/{offset}")
    @Operation(summary = "Get the itv with search parameter in pagination format")
    @ApiResponses(value = {
            @ApiResponse(description= "The itv filtered", content =  {
                    @Content(schema = @Schema(implementation = String.class))
            })
    })
    public List<ItvSearchDto> getItvs(@PathVariable Long limit, @PathVariable Long offset, @RequestBody(required = false) SearchItvPayload searchParameter, AccountTokenDto account) {
        return itvService.getItvsWithOffsetOrderByMostRecentDateBegin(limit, offset, searchParameter, account.getId());
    }

    @GetMapping(path = "/{itvId}")
    @Operation(summary = "Get an ITV")
    public ItvDetailDto getItv(@PathVariable Long itvId) {
        return itvService.getItv(itvId);
    }

    @DeleteMapping(path = "/{itvId}")
    @Operation(summary = "Delete an ITV")
    public void deleteItv(@PathVariable Long itvId) {
        itvService.deleteItv(itvId);
    }

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

    @PostMapping(path = "/{itvId}/picture")
    @Operation(summary = "Update the list of picture linked to an ITV for the reference of the attachment")
    public List<ItvPictureDto> updateListItvPicture(@PathVariable Long itvId, @RequestBody List<ItvPictureUploadDto> listItvPictureDto, AccountTokenDto account) {
        itvService.updateListItvPicture(listItvPictureDto, account.getId());
        return itvPictureRepository.getListItvPictureByItvId(itvId);
    }

    @GetMapping(path = "/{itvId}/workorder")
    @Operation(summary = "Get the list of workorder linked to an ITV")
    public List<TaskSearchDto> getListTaskByItvId(@PathVariable Long itvId) {
        return workorderRepository.getListTaskByItvId(itvId);
    }

    @PostMapping(path = "/export")
    @Operation(summary = "Get an empty ITV file for the assets")
    public ResponseEntity<byte[]> exportEmptyItvFile(@RequestBody ExportItvParamDto exportItvParamDto) throws TransformerException, ParserConfigurationException {
        ExportItvDto exportItvDto = itvService.exportEmptyItvFile(exportItvParamDto.getListAsset(), exportItvParamDto.getFileType());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.add(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION);

        headers.setContentDispositionFormData("attachment", exportItvDto.getFilename());
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        headers.setContentLength(exportItvDto.getData().length);

        return new ResponseEntity<>(exportItvDto.getData(), headers, HttpStatus.OK);
    }
}
