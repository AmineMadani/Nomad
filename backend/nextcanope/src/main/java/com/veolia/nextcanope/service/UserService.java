package com.veolia.nextcanope.service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.payload.UserCreationPayload;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
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

	public Users getUserById(Long userId) {
		return this.userRepository.findById(userId).orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas."));
	}
	
	/**
	 * Update the user data
	 * @param userId the user id to update
	 * @param updateUser the update data
	 * @return the account dto
	 */
	public AccountDto updateUser(Long userId, AccountDto updateUser) {
		Users user = userRepository.findById(userId).orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas."));

		user.setUsrConfiguration(updateUser.getUsrConfiguration());
		user.setUsrDmod(new Date());
		user.setModifiedBy(user);

		try {
			userRepository.save(user);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde de l'utilisateur avec l'id " + userId + ".");
		}

		return updateUser;
	}

	public void createUser(UserCreationPayload userPayload, Long uCreId) {
		Users uCreUser = new Users();
		uCreUser.setId(uCreId);

		Users user = new Users();
		user.setUsrFirstName(userPayload.getFirstname());
		user.setUsrLastName(userPayload.getLastname());
		user.setUsrEmail(userPayload.getMail());
		user.setUsrStatus(userPayload.getStatus());
		user.setUsrCompany(userPayload.getCompany());
		user.setCreatedBy(uCreUser);
		user.setModifiedBy(uCreUser);
		user.setUsrValid(true);
		user.setUsrDcre(new Date());
		user.setUsrDmod(new Date());

		try {
			this.userRepository.save(user);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la création d'un utilisateur.", e.getMessage());
		}
	}
}
