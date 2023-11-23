package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.itv.ItvPictureDto;
import com.veolia.nextcanope.dto.itv.ItvVersionEnumDto;
import com.veolia.nextcanope.model.ItvPicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItvPictureRepository extends JpaRepository<ItvPicture, Long> {

    @Query(
            value = "SELECT ID as id," +
                    "       ITP_LABEL as itpLabel, " +
                    "       ITP_REFERENCE as itpReference " +
                    "FROM nomad.ITV_PICTURE " +
                    "WHERE ITV_ID = :itvId ",
            nativeQuery = true
    )
    List<ItvPictureDto> getListItvPictureByItvId(@Param("itvId") Long itvId);
}
