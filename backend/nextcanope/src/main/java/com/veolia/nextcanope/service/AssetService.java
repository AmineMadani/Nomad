package com.veolia.nextcanope.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.model.Asset;
import com.veolia.nextcanope.model.Layer;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.AssetRepository;

/**
 * AssetService is a service class for managing asset-related data.
 * It interacts with the assetRepository to access and manipulate the data.
 */
@Service
public class AssetService {
	
    @Autowired
    AssetRepository assetRepository;

	@Autowired
	LayerService layerService;

	@Autowired
	UserService userService;

    /**
     * Retrieves or create the wanted asset.
     *
     * @return The asset.
     */
    public Asset getNewOrExistingAsset(String assetRef, String tableRef, Long userId) {
		// Asset
		Asset asset = new Asset();
		// Layer
		String lyrTableName = "asset."+tableRef.replace("asset.", "");
		Layer layer = this.layerService.getLayerByLyrTableName(lyrTableName);
		// User
		Users user = this.userService.getUserById(userId);

		asset.setAssObjRef(assetRef);
    	asset.setLayer(layer);
		asset.setCreatedBy(user);
		asset.setModifiedBy(user);
		asset.setAssValid(true);
		
		Asset assetDb = assetRepository.findByAssObjRefAndLayer_LyrTableName(asset.getAssObjRef(), asset.getLayer().getLyrTableName());
		if (assetDb != null) {
			asset = assetDb;
		}
		
        return asset;
    }

	/**
	 * Finds an Asset entity based on the provided ass_obj_ref and ass_obj_table
	 * @param assetObjRef Id of the asset
	 * @param lyrTableName Name of the table asset
	 * @return the asset
	 */
	public Asset getAssetByIdAndTable(String assetObjRef, String lyrTableName) {
		return assetRepository.findByAssObjRefAndLayer_LyrTableName(assetObjRef, lyrTableName);
	}
}
