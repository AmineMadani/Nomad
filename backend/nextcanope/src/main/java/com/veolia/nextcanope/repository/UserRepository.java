package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.AppUser;

/**
 * UserRepository is an interface for managing AppUser entities in the persistence layer.
 * It extends JpaRepository, which provides generic CRUD operations.
 */
public interface UserRepository extends JpaRepository<AppUser, Long> {

	/**
     * Finds an AppUser entity based on the provided email.
     *
     * @param email The email address used to search for the corresponding AppUser entity.
     * @return The AppUser entity associated with the given email, or null if not found.
     */
	AppUser findByEmail(String email);
}
