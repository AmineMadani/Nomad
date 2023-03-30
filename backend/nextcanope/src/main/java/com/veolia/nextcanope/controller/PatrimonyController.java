package com.veolia.nextcanope.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.service.PatrimonyService;

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
