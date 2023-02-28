package com.veolia.nextcanope.service;

import com.veolia.nextcanope.model.Basemaps;
import com.veolia.nextcanope.repository.BasemapsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

@Service
public class BasemapsService {
    @Autowired
    BasemapsRepository basemapsRepository;

    public List<Basemaps> getVisibleBasemaps() {
        // TO DO - find by user's contracts ids
        return this.basemapsRepository.findByDisplay(true);
    }
}
