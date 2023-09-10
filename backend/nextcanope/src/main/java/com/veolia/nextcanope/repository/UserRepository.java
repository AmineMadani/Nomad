package com.veolia.nextcanope.repository;

import com.veolia.nextcanope.configuration.NomadRepository;

import com.veolia.nextcanope.model.Users;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * UserRepository is an interface for managing Users entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface UserRepository extends NomadRepository<Users, Long> {

	/**
     * Finds an Users entity based on the provided email.
     *
     * @param usrEmail The email address used to search for the corresponding AppUser entity.
     * @return The AppUser entity associated with the given email, or null if not found.
     */
	Optional<Users> findByUsrEmail(String usrEmail);

	@Query("SELECT u " +
			"FROM Users u " +
			"	LEFT JOIN FETCH u.listOfUsrCtrPrf p " +
			"	LEFT JOIN FETCH p.contract " +
			"	LEFT JOIN FETCH p.profile " +
			"WHERE u.id = :id")
	Optional<Users> findUsrAndListOfUsrCtrPrfById(@Param("id") Long id);
}
