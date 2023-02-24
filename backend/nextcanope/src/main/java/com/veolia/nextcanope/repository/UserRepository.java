package com.veolia.nextcanope.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.veolia.nextcanope.model.AppUser;

public interface UserRepository extends JpaRepository<AppUser, Long> {

}
