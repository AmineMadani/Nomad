package com.veolia.nextcanope.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.UserRepository;

/**
 * AssetService is a service class for managing asset-related data.
 * It interacts with the assetRepository to access and manipulate the data.
 */
@Service
public class UserService {
	
    @Autowired
	UserRepository userRepository;

    /**
     * Find all user account.
     *
     * @return List of user account.
     */
	public List<AccountDto> getAllUserAccount() {
		List<Users> users = this.userRepository.findAll();
		return users.stream().map(AccountDto::new).collect(Collectors.toList());
	}
	
	/**
	 * Update the user data
	 * @param userId the user id to update
	 * @param updateUser the update data
	 * @return the account dto
	 */
	public AccountDto updateUser(Long userId, AccountDto updateUser) {
		Optional<Users> optUser = userRepository.findById(userId);
		if (optUser.isEmpty()) {
			throw new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas.");
		}

		Users user = optUser.get();
		user.setUsrConfiguration(updateUser.getUsrConfiguration());
		user.setUsrDmod(new Date());
		user.setUsrUmodId(userId);

		try {
			userRepository.save(user);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde de l'utilisateur avec l'id " + userId + ".");
		}

		return updateUser;
	}
}
