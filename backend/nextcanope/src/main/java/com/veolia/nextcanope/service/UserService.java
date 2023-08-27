package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import com.veolia.nextcanope.dto.account.AccountPerimeterDto;
import com.veolia.nextcanope.model.*;
import com.veolia.nextcanope.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.account.AccountDto;
import com.veolia.nextcanope.exception.FunctionalException;
import com.veolia.nextcanope.exception.TechnicalException;
import com.veolia.nextcanope.repository.UserRepository;

/**
 * AssetService is a service class for managing asset-related data.
 * It interacts with the assetRepository to access and manipulate the data.
 */
@Service
public class UserService {
	
    @Autowired
	UserRepository userRepository;

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ContractService contractService;

	public Users getUserById(Long userId) {
		return this.userRepository.findById(userId).orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas."));
	}

    /**
     * Find all user account.
     *
     * @return List of user account.
     */
	public List<AccountDto> getAllUserAccount() {
		List<Users> users = this.userRepository.findAll();
		return users.stream()
				.sorted(Comparator.comparing(Users::getUsrDcre))
				.map(AccountDto::new)
				.toList();
	}

	public AccountDto getAccountById(Long userId) {
		Users user = getUserById(userId);
		return new AccountDto(user);
	}

	/**
	 * Update a user
	 * @param newAccount the creation data
	 * @param uCreId the user who makes the operation
	 */
	public void createUser(AccountDto newAccount, Long uCreId) {
		// Check if a user already exist with the same email
		if (this.userRepository.findByUsrEmail(newAccount.getEmail()).isPresent()) {
			throw new FunctionalException(
				"Un utilisateur avec l'email " + newAccount.getEmail() + " existe déjà."
			);
		}

		Users user = new Users();
		// Global info
		user.setUsrFirstName(newAccount.getFirstName());
		user.setUsrLastName(newAccount.getLastName());
		user.setUsrEmail(newAccount.getEmail());
		user.setUsrStatus(newAccount.getStatus());
		user.setUsrCompany(newAccount.getCompany());
		user.setUsrValid(true);
		// Created and Modified by
		Users uCreUser = getUserById(uCreId);
		user.setCreatedBy(uCreUser);
		user.setModifiedBy(uCreUser);
		// Perimeters
		List<UsrCtrPrf> usrCtrPrfList = new ArrayList<>();
		for (AccountPerimeterDto perimeter : newAccount.getPerimeters()) {
			// Get profile
			Profile profile = this.profileRepository
					.findById(perimeter.getProfileId())
					.orElseThrow(() -> new FunctionalException("Le profil avec l'id " + perimeter.getProfileId() + " n'existe pas."));

			// Browse contracts
			for (Long contractId : perimeter.getContractIds()) {
				UsrCtrPrf usrCtrPrf = new UsrCtrPrf();
				// Set profile
				usrCtrPrf.setProfile(profile);

				// Set User
				usrCtrPrf.setUser(user);

				// Set Contract
				Contract contract = this.contractService.getContractById(contractId);
				usrCtrPrf.setContract(contract);

				// Set creation and modification user
				usrCtrPrf.setCreatedBy(uCreUser);
				usrCtrPrf.setModifiedBy(uCreUser);

				usrCtrPrfList.add(usrCtrPrf);
			}
		}
		user.setListOfUsrCtrPrf(usrCtrPrfList);

		try {
			this.userRepository.save(user);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la création d'un utilisateur.", e.getMessage());
		}
	}

	/**
	 * Update the user data
	 * @param accountToUpdate the update data
     * @param uModId the user who makes the operation
	 */
	public void updateUser(Long userIdToUpdate, AccountDto accountToUpdate,  Long uModId) {
		Users user = userRepository.findById(userIdToUpdate)
				.orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + accountToUpdate.getId() + " n'existe pas."));

		// Global info
		user.setUsrEmail(accountToUpdate.getEmail());
		user.setUsrFirstName(accountToUpdate.getFirstName());
		user.setUsrLastName(accountToUpdate.getLastName());
		user.setUsrValid(accountToUpdate.getIsValid());
		user.setUsrStatus(accountToUpdate.getStatus());
		user.setUsrCompany(accountToUpdate.getCompany());
		user.setUsrConfiguration(accountToUpdate.getUsrConfiguration());
		// Modified by
		Users uModUser = getUserById(uModId);
		user.setModifiedBy(uModUser);

		// Perimeters
		// We set mark as deleted the missed usrCtrPrfList in accountToUpdate
		List<Long> contractIdsToUpdate = accountToUpdate.getPerimeters().stream()
				.map(AccountPerimeterDto::getContractIds)
				.flatMap(List::stream)
				.toList();
		for (UsrCtrPrf usrCtrPrf : user.getListOfUsrCtrPrf()) {
			if (!contractIdsToUpdate.contains(usrCtrPrf.getContract().getId())) {
				usrCtrPrf.markAsDeleted(user);
			}
		}
		// We add or set usrCtrPrfList find in accountToUpdate
		List<UsrCtrPrf> usrCtrPrfList = new ArrayList<>(user.getListOfUsrCtrPrf());
		for (AccountPerimeterDto perimeter: accountToUpdate.getPerimeters()) {
			// Get profile
			Profile profile = this.profileRepository
					.findById(perimeter.getProfileId())
					.orElseThrow(() -> new FunctionalException("Le profil avec l'id " + perimeter.getProfileId() + " n'existe pas."));

			for (Long contractId : perimeter.getContractIds()) {
				Contract contract = this.contractService.getContractById(contractId);

				UsrCtrPrf usrCtrPrf = user.getListOfUsrCtrPrf()
						.stream()
						.filter(per -> per.getContract().getId().equals(contractId))
						.findFirst().orElse(null);

				if (usrCtrPrf != null) {
					usrCtrPrf.setDeletedAt(null);
					usrCtrPrf.setProfile(profile);
                } else {
					usrCtrPrf = new UsrCtrPrf();
					usrCtrPrf.setProfile(profile);
					usrCtrPrf.setUser(user);
					usrCtrPrf.setContract(contract);
					usrCtrPrf.setCreatedBy(uModUser);
                }
                usrCtrPrf.setModifiedBy(uModUser);
                usrCtrPrfList.add(usrCtrPrf);
            }
		}
		user.setListOfUsrCtrPrf(usrCtrPrfList);

		try {
			userRepository.save(user);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la sauvegarde de l'utilisateur avec l'id " + accountToUpdate.getId() + ".", e.getMessage());
		}
	}

	/**
	 * Delete a list of user.
	 * It's only a logical deletion.
	 */
	public void deleteUsers(List<Long> userIds, Long uModId) {
		// Create the current user instance
		Users uModUser = new Users();
		uModUser.setId(uModId);

		List<Users> usersToDelete = new ArrayList<>();
		for (Long userId : userIds) {
			// Check if the user already exist
			Users user = this.getUserById(userId);
			// Mark layer styles and children as deleted
			user.markAsDeleted(uModUser);
			for (UsrCtrPrf usrCtrPrf : user.getListOfUsrCtrPrf()) {
				usrCtrPrf.markAsDeleted(user);
			}
			usersToDelete.add(user);
		}

		// It saves users in the db
		try {
			this.userRepository.saveAll(usersToDelete);
		} catch (Exception e) {
			throw new TechnicalException("Erreur lors de la suppression des utilisateurs.", e.getMessage());
		}
	}

}
