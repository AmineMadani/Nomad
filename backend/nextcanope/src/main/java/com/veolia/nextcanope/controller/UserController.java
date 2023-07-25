package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.dto.payload.UserCreationPayload;
import com.veolia.nextcanope.utils.ResponseMessage;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.repository.UserRepository;
import com.veolia.nextcanope.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;


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
	public AccountDto updateUser(AccountTokenDto account, @RequestBody AccountDto savingAccount) {
		return userService.updateUser(account.getId(), savingAccount);
	}

	@GetMapping(path = "/all-account")
	@Operation(summary = "Get all user account")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Find all user account")
	})
	public List<AccountDto> getAllUserAccount() {
		return this.userService.getAllUserAccount();
	}

	@PostMapping(path = "/")
	@Operation(summary = "Create a new user.")
	@ApiResponses(value = {
			@ApiResponse(description= "Creation of an user", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public ResponseMessage createUser(@RequestBody UserCreationPayload userPayload, AccountTokenDto account) {
		this.userService.createUser(userPayload, account.getId());
		return new ResponseMessage("L'utilisateur a été créé avec succès.");
	}
}
