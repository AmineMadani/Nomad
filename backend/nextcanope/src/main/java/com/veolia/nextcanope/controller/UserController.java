package com.veolia.nextcanope.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.UserContextDto;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.repository.UserRepository;

import java.util.List;
import java.util.Optional;

import com.veolia.nextcanope.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/user")
@Tag(name = "User Management System", description = "Operations pertaining to user in the User Management System")
public class UserController {

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserService userService;

	@GetMapping(path = "/information")
	@Operation(summary = "Get the user information")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Account based on the token and the database")
	})
	public AccountDto getUserInformation(AccountTokenDto account) {
		return new AccountDto(account);
	};
	
	@PutMapping(path ="/update")
	@Operation(summary = "Update the user data")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "User data is updated")
	})
	public AccountDto updateUser(AccountTokenDto account, @RequestBody AccountDto savingAccount) throws Exception {
		return userService.updateUser(account.getId(), savingAccount);
	}

	@PutMapping(path ="/user-context")
	@Operation(summary = "Set the user context")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "save the context in database")
	})
	public String putUserContext(AccountTokenDto account, @RequestBody UserContextDto userContextDto) throws Exception {
		Long id = account.getId();
		Optional<Users> user = userRepository.findById(id);
		ObjectMapper mapper = new ObjectMapper();
		if (user.isEmpty())
		{
			throw new Exception("unknown user");
		}
		user.get().setUsrCtxt(mapper.writeValueAsString(userContextDto));

		userRepository.save(user.get());
		return user.get().getUsrCtxt();
	}

	@GetMapping(path = "/all-account")
	@Operation(summary = "Get all user account")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Find all user account")
	})
	public List<AccountDto> getAllUserAccount() {
		return this.userService.getAllUserAccount();
	}
}
