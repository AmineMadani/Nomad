package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.model.ItvVersion;
import com.veolia.nextcanope.model.ItvVersionId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItvVersionRepository extends JpaRepository<ItvVersion, ItvVersionId> {

}
