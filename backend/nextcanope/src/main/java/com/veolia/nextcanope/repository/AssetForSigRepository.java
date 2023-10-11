package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.AssetForSig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssetForSigRepository extends JpaRepository<AssetForSig, Long> {

    Optional<AssetForSig> findByAfsCacheId(Long afsCacheId);
}
