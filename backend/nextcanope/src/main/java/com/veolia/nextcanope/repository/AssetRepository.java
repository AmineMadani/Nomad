package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * AssetRepository is an interface for managing Asset entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface AssetRepository extends JpaRepository<Asset, Long> {

	/**
     * Finds an Asset entity based on the provided ass_obj_ref and lyr_table_name.
     *
     * @param assObjRef Id of the asset.
     * @param lyrTableName Name of the table asset.
     * @return The asset
     */
	Asset findByAssObjRefAndLayer_LyrTableName(String assObjRef, String lyrTableName);
}
