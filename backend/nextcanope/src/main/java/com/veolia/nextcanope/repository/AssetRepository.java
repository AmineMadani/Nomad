package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.Asset;

/**
 * AssetRepository is an interface for managing Asset entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface AssetRepository extends JpaRepository<Asset, Long> {

	/**
     * Finds an Asset entity based on the provided ass_obj_ref and ass_obj_table.
     *
     * @param assObjRef Id of the asset.
     * @param assObjTable Name of the table asset.
     * @return The asset
     */
	Asset findByAssObjRefAndAssObjTable(String assObjRef, String assObjTable);
}
