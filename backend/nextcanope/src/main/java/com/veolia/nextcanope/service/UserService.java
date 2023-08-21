package com.veolia.nextcanope.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.veolia.nextcanope.dto.user.UserPerimeterDto;
import com.veolia.nextcanope.model.Contract;
import com.veolia.nextcanope.model.Profile;
import com.veolia.nextcanope.model.UsrCtrPrf;
import com.veolia.nextcanope.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.user.UserDetailDto;
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

	@Autowired
	ProfileRepository profileRepository;

	@Autowired
	ContractService contractService;

    /**
     * Find all user account.
     *
     * @return List of user account.
     */
	public List<AccountDto> getAllUserAccount() {
		List<Users> users = this.userRepository.findAll(Sort.by(Sort.Order.desc("usrDcre")));
		return users.stream().map(AccountDto::new).collect(Collectors.toList());
	}

	public Users getUserById(Long userId) {
		return this.userRepository.findById(userId).orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas."));
	}

	public UserDetailDto getUserDetailById(Long userId) {
		Users user = this.userRepository.findById(userId).orElseThrow(() -> new FunctionalException("L'utilisateur avec l'id " + userId + " n'existe pas."));
		return new UserDetailDto(user);
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

	public void createUser(UserDetailDto userPayload, Long uCreId) {
		// Check if a user already exist with the same email
		if (this.userRepository.findByUsrEmail(userPayload.getEmail()).isPresent()) {
			throw new FunctionalException(
				"Un utilisateur avec l'email " + userPayload.getEmail() + " existe déjà."
			);
		}

		Users uCreUser = getUserById(uCreId);
		Users user = new Users();
		user.setUsrFirstName(userPayload.getFirstName());
		user.setUsrLastName(userPayload.getLastName());
		user.setUsrEmail(userPayload.getEmail());
		user.setUsrStatus(userPayload.getStatus());
		user.setUsrCompany(userPayload.getCompany());
		user.setCreatedBy(uCreUser);
		user.setModifiedBy(uCreUser);
		user.setUsrValid(true);

		List<UsrCtrPrf> usrCtrPrfList = new ArrayList<>();
		for (UserPerimeterDto perimeter : userPayload.getPerimeters()) {
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
}
