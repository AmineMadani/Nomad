package com.veolia.nextcanope.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.repository.BasemapsRepository;

@Service
public class BasemapsService {
    @Autowired
    BasemapsRepository basemapsRepository;

    public List<Basemaps> getVisibleBasemaps() {
        // TO DO - find by user's contracts ids
        return this.basemapsRepository.findByDisplay(true);
    }
}
