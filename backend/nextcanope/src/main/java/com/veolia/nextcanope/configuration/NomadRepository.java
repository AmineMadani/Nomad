package com.veolia.nextcanope.configuration;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import java.io.Serializable;
import java.util.List;

@NoRepositoryBean
public interface NomadRepository<T, ID extends Serializable> extends JpaRepository<T, ID> {
    @Query("select e from #{#entityName} e where e.deletedAt is null")
    List<T> findAll();
}
