package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.TaskSearchDto;
import com.veolia.nextcanope.dto.itv.ItvSearchDto;
import com.veolia.nextcanope.model.Itv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

public interface ItvRepository extends JpaRepository<Itv, Long> {

    /**
     * Get the list of itv for specific filters and pagination
     * @param wtsIds Array of status ids
     * @param wtrIds Array of actions ids
     * @param appointment boolean for appointment value
     * @param emergency boolean for emergency value
     * @param beginDate Date before wkoPlanningStartDate
     * @param endDate Date after wkoPlanningStartDate
     * @param nbLimit limit for pagination
     * @param nbOffset Offset for pagination
     * @return the list itv found
     */
    @Query(
            value = "SELECT itv.ID as id, " +
                    "       itv.ITV_FILENAME as itvFilename, " +
                    "       itv.ITV_STATUS as itvStatus, " +
                    "       itv.ITV_DCRE as itvDcre, " +
                    "       CASE WHEN (SELECT COUNT(*) FROM nomad.ITV_BLOCK itb WHERE itb.ITV_ID = itv.ID AND itb.ITB_STRUCTURAL_DEFECT = true) > 0" +
                    "           THEN true" +
                    "           ELSE false" +
                    "       END as itvStructuralDefect, " +
                    "       CASE WHEN (SELECT COUNT(*) FROM nomad.ITV_BLOCK itb WHERE itb.ITV_ID = itv.ID AND itb.ITB_FUNCTIONAL_DEFECT = true) > 0" +
                    "           THEN true" +
                    "           ELSE false" +
                    "       END as itvFunctionalDefect, " +
                    "       CASE WHEN (SELECT COUNT(*) FROM nomad.ITV_BLOCK itb WHERE itb.ITV_ID = itv.ID AND itb.ITB_OBSERVATION = true) > 0" +
                    "           THEN true" +
                    "           ELSE false" +
                    "       END as itvObservation " +
                    "FROM nomad.ITV itv " +
                    "WHERE itv.ID IN ( " +
                    "   SELECT itv2.ID " +
                    "   FROM nomad.ITV itv2 " +
                    "   INNER JOIN nomad.ITV_BLOCK itb2 ON itb2.ITV_ID = itv2.ID " +
                    "   LEFT OUTER JOIN asset.ASS_COLLECTEUR col ON itb2.ITB_OBJ_TABLE = 'ass_collecteur' " +
                    "                                           AND col.ID = itb2.ITB_OBJ_REF " +
                    "   LEFT OUTER JOIN nomad.CONTRACT ctr_col ON ctr_col.CTR_CODE = col.CODE_CONTRAT " +
                    "   LEFT OUTER JOIN nomad.CITY cty_col ON cty_col.CTY_CODE = col.INSEE_CODE " +
                    "   LEFT OUTER JOIN asset.ASS_BRANCHE bra ON itb2.ITB_OBJ_TABLE = 'ass_branche' " +
                    "                                        AND bra.ID = itb2.ITB_OBJ_REF " +
                    "   LEFT OUTER JOIN nomad.CONTRACT ctr_bra ON ctr_bra.CTR_CODE = bra.CODE_CONTRAT " +
                    "   LEFT OUTER JOIN nomad.CITY cty_bra ON cty_bra.CTY_CODE = bra.INSEE_CODE " +
                    "   WHERE (COALESCE(:status, NULL) IS NULL OR itv2.ITV_STATUS in :status) " +
                    "   AND (" +
                    "       COALESCE(:contractIds, NULL) IS NULL " +
                    "       OR ctr_col.ID in :contractIds " +
                    "       OR ctr_bra.ID in :contractIds " +
                    "   ) " +
                    "   AND (" +
                    "       COALESCE(:cityIds, NULL) IS NULL " +
                    "       OR cty_col.ID in :cityIds " +
                    "       OR cty_bra.ID in :cityIds " +
                    "   ) " +
                    "   AND (" +
                    "       COALESCE(:defects, NULL) IS NULL " +
                    "       OR ('O' in :defects AND itb2.ITB_STRUCTURAL_DEFECT = true) " +
                    "       OR ('S' in :defects AND itb2.ITB_STRUCTURAL_DEFECT = true) " +
                    "       OR ('F' in :defects AND itb2.ITB_OBSERVATION = true) " +
                    "   ) " +
                    "   AND (COALESCE(:startDate, NULL) IS NULL OR itv2.ITV_DCRE >= :startDate) " +
                    "   AND (COALESCE(:endDate, NULL) IS NULL OR itv2.ITV_DCRE <= :endDate) " +
                    ") " +
                    "ORDER BY itv.ITV_DCRE DESC " +
                    "LIMIT :nbLimit OFFSET :nbOffset",
            nativeQuery = true
    )
    List<ItvSearchDto> getItvsWithOffsetOrderByMostRecentDateBegin(
            @Param("nbLimit") Long nbLimit, @Param("nbOffset") Long nbOffset,
            @Param("contractIds") List<Long> contractIds, @Param("cityIds") List<Long> cityIds,
            @Param("status") List<String> status, @Param("defects") List<String> defects,
            @Param("startDate") Date startDate, @Param("endDate") Date endDate
    );

}
