package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.dto.Contract.ContractOrgProjectionDto;
import com.veolia.nextcanope.dto.Contract.ContractDto;
import com.veolia.nextcanope.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * ContractRepository is an interface for managing Contract entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query(value =
            "select " +
            "    ctr.id, " +
            "    ctr.ctr_code as ctrCode, " +
            "    ctr.ctr_slabel as ctrSlabel, " +
            "    ctr.ctr_llabel as ctrLlabel, " +
            "    ctr.ctr_valid as ctrValid, " +
            "    COALESCE(ctr.ctr_end_date <= CURRENT_TIMESTAMP, FALSE) as ctrExpired , " +
            "    org.id as orgId, " +
            "    org.org_code as orgCode, " +
            "    org.org_slabel as orgSlabel, " +
            "    org.org_llabel as orgLlabel, " +
            "    out.out_code as outCode, " +
            "    org.org_valid as orgValid, " +
            "    org_parent.id as orgParentId, " +
            "    org_parent.org_llabel as orgParentLlabel " +
            "from nomad.contract ctr " +
            "    inner join nomad.org_ctr on ctr.id = org_ctr.ctr_id " +
            "    inner join nomad.organizational_unit org on org_ctr.org_id = org.id " +
            "    inner join nomad.organizational_unit_type out on org.out_id = out.id " +
            "    inner join nomad.organizational_unit org_parent on org.org_parent_id = org_parent.id " +
            "order by ctr.ctr_llabel;",
            nativeQuery = true
    )
    List<ContractOrgProjectionDto> getAllContractWithOrganizationalUnits();

    @Query(value = "SELECT id " +
            "FROM nomad.contract ctr " +
            "WHERE ST_Intersects(ctr.geom, ST_SetSRID(ST_MakePoint(:longitude, :latitude),4326))",
            nativeQuery = true
    )
    List<Long> getContractIdsByLatitudeLongitude(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude
    );

    @Query(value="select ctr.id," +
            " ctr.ctr_code as ctrCode," +
            " ctr.ctr_slabel as ctrSlabel," +
            " ctr.ctr_llabel as ctrLlabel," +
            " ctr.ctr_valid as ctrValid," +
            " ctr.ctr_start_date as ctrStartDate," +
            " ctr.ctr_end_date as ctrEndDate," +
            " COALESCE(ctr.ctr_end_date <= CURRENT_TIMESTAMP, FALSE) as ctrExpired " +
            " from nomad.contract ctr" +
            " join nomad.usr_ctr_prf ucp" +
            " on ucp.ctr_id=ctr.id" +
            " and ucp.usr_id = :userId" +
            " and ucp.usc_ddel is null",
    		nativeQuery = true)
    List<ContractDto> getAllUserContracts(@Param("userId") Long userId);
}
