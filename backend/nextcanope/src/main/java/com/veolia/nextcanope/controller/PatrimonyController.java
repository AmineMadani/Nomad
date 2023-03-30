package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.repository.PatrimonyRepositoryImpl;
import com.veolia.nextcanope.service.BasemapsService;
import com.veolia.nextcanope.service.PatrimonyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/patrimony")
public class PatrimonyController {

    @Autowired
    public PatrimonyService patrimonyService;

    @GetMapping(path = "/{key}")
    public String getIndexByKey(@PathVariable String key) {
        return this.patrimonyService.getIndexByKey(key);
    }

    @GetMapping(path = "/{key}/{tileNumber}")
    public String getEquipmentTile(@PathVariable String key, @PathVariable Long tileNumber) {
        return this.patrimonyService.getEquipmentTile(key, tileNumber);
    }
}
