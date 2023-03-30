package com.veolia.nextcanope.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.service.BasemapsService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/basemaps")
public class BasemapsController {

    @Autowired
    public BasemapsService basemapsService;

    @GetMapping(path = "/")
    public List<Basemaps> getBasemaps() {
        return this.basemapsService.getVisibleBasemaps();
    }
}
