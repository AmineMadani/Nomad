package com.veolia.nextcanope.repository;

import com.nimbusds.jose.shaded.gson.JsonObject;
import jakarta.persistence.*;
import org.hibernate.query.NativeQuery;
import org.hibernate.transform.Transformers;
import org.springframework.stereotype.Repository;

@Repository
public class PatrimonyRepositoryImpl {

    @PersistenceContext
    private EntityManager entityManager;

    public Object getPatrimonyIndex(String key) {
        Object index = null;

        String req = "select config.get_geojson_index('" + key + "')";
        Query query = entityManager.createNativeQuery(req);
        NativeQuery nativeQuery = query.unwrap(NativeQuery.class);

        try {
            index = query.getSingleResult();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return index;
    }
}
