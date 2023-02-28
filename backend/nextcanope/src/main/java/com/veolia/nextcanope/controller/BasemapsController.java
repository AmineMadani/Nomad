package com.veolia.nextcanope.controller;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.service.BasemapsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

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
