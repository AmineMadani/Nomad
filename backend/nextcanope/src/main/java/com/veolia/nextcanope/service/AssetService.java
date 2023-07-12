package com.veolia.nextcanope.service;

import java.util.Date;

import com.veolia.nextcanope.exception.TechnicalException;
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
    public Asset getAsset(String assetRef, String tableRef, AccountTokenDto account) {
		Asset asset = new Asset();

		asset.setAssObjRef(assetRef);
    	asset.setAssObjTable("asset."+tableRef);
		asset.setAssUcreId(account.getId());
		asset.setAssUmodId(account.getId());
		asset.setAssDcre(new Date());
		asset.setAssDmod(new Date());
		asset.setAssValid(true);
		
		Asset assetDb = assetRepository.findByAssObjRefAndAssObjTable(asset.getAssObjRef(), asset.getAssObjTable());
		if(assetDb != null) {
			asset = assetDb;
		} else {
			try {
				asset = assetRepository.save(asset);
			} catch (Exception e) {
				throw new TechnicalException("Erreur lors de la sauvegarde de l'asset pour l'utilisateur avec l'id  " + account.getId() + ".");
			}
		}
		
        return asset;
    }

	/**
	 * Finds an Asset entity based on the provided ass_obj_ref and ass_obj_table
	 * @param assetObjRef Id of the asset
	 * @param assetObjTable Name of the table asset
	 * @return the asset
	 */
	public Asset getAssetByIdAndTable(String assetObjRef, String assetObjTable) {
		return assetRepository.findByAssObjRefAndAssObjTable(assetObjRef, assetObjTable);
	}
}
