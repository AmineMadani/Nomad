package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.Users;

/**
 * UserRepository is an interface for managing Users entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface UserRepository extends JpaRepository<Users, Long> {

	/**
     * Finds an Users entity based on the provided email.
     *
     * @param email The email address used to search for the corresponding AppUser entity.
     * @return The AppUser entity associated with the given email, or null if not found.
     */
	Users findByUsrEmail(String usrEmail);
}
