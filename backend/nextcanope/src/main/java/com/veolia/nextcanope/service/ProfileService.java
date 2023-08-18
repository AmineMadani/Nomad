package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.ProfileDto;
import com.veolia.nextcanope.model.Profile;
import com.veolia.nextcanope.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * ProfileService is a service class for managing asset-related data.
 * It interacts with the profileRepository to access and manipulate the data.
 */
@Service
public class ProfileService {
    @Autowired
	ProfileRepository profileRepository;

	/**
	 * Get the list of profile from the database
	 * It maps the profile list to a list of profile DTO
	 * @return the list of profile
	 */
	public List<ProfileDto> getAllProfiles() {
		List<Profile> profiles = this.profileRepository.findAll();

		return profiles.stream().map(ProfileDto::new).toList();
	}
}
