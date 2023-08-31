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
            "    org.id as orgId, " +
            "    org.org_code as orgCode, " +
            "    org.org_slabel as orgSlabel, " +
            "    org.org_llabel as orgLlabel, " +
            "    out.out_code as outCode, " +
            "    org.org_valid as orgValid, " +
            "    org.org_parent_id as orgParentId " +
            "from nomad.contract ctr " +
            "    inner join nomad.org_ctr on ctr.id = org_ctr.ctr_id " +
            "    inner join nomad.organizational_unit org on org_ctr.org_id = org.id " +
            "    inner join nomad.organizational_unit_type out on org.out_id = out.id " +
            "order by ctr.ctr_llabel;",
            nativeQuery = true
    )
    List<ContractOrgProjectionDto> getAllContractWithOrganizationalUnits();

    @Query(value = "SELECT id " +
            "FROM nomad.contract ctr " +
            "WHERE ST_Intersects(ctr.geom, st_transform(st_setsrid(st_geomfromtext('POINT('||':longitude'|| ' '||':latitude'||')'),4326),3857))",
            nativeQuery = true
    )
    List<Long> getContractIdsByLatitudeLongitude(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude
    );

    @Query("select c from Contract c ")
    List<ContractDto> getAllContracts();
}
