package com.veolia.nextcanope.repository;

import org.hibernate.query.NativeQuery;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

@Repository
public class PatrimonyRepositoryImpl {

    @PersistenceContext
    private EntityManager entityManager;

    public Object getPatrimonyIndex(String key) {
        Object index = null;

        String req = "select config.get_geojson_index('" + key + "')";
        Query query = entityManager.createNativeQuery(req);
        query.unwrap(NativeQuery.class);

        try {
            index = query.getSingleResult();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return index;
    }
}
