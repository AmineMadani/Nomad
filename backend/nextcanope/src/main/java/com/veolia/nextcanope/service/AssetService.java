package com.veolia.nextcanope.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.model.Asset;
import com.veolia.nextcanope.repository.AssetRepository;

/**
 * AssetService is a service class for managing asset-related data.
 * It interacts with the assetRepository to access and manipulate the data.
 */
@Service
public class AssetService {
	
    @Autowired
    AssetRepository assetRepository;

    /**
     * Retrieves or create the wanted asset.
     *
     * @return The asset.
     */
    public Asset getAsset(Asset asset, AccountTokenDto account) {
    	
    	asset.setAssObjTable("asset."+asset.getAssObjTable());
		asset.setAssUcreId(account.getId());
		asset.setAssUmodId(account.getId());
		asset.setAssDcre(new Date());
		asset.setAssDmod(new Date());
		asset.setAssValid(true);
		
		Asset assetDb = assetRepository.findByAssObjRefAndAssObjTable(asset.getAssObjRef(), asset.getAssObjTable());
		if(assetDb != null) {
			asset = assetDb;
		} else {
			asset = assetRepository.save(asset);
		}
		
        return asset;
    }
}
