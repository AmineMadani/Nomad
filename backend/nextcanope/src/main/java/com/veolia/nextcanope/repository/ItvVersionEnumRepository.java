package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.itv.ItvVersionEnumDto;
import com.veolia.nextcanope.model.ItvVersionEnum;
import com.veolia.nextcanope.model.ItvVersionEnumId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ItvVersionEnumRepository extends JpaRepository<ItvVersionEnum, ItvVersionEnumId> {

    @Query(
            value = "SELECT * FROM ITV_VERSION_ENUM ",
            nativeQuery = true
    )
    List<ItvVersionEnumDto> getListItvVersionEnum();
}
