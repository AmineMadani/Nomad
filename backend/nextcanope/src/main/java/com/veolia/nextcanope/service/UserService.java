package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.model.Asset;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.AssetRepository;
import com.veolia.nextcanope.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

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
}
