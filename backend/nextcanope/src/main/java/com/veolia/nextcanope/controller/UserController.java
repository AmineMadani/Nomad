package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.utils.ResponseMessage;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.dto.account.AccountDto;
import com.veolia.nextcanope.dto.account.AccountTokenDto;
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

	@GetMapping(path = "/current")
	@Operation(summary = "Get the current user")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Account based on the token and the database")
	})
	public AccountDto getUserInformation(AccountTokenDto account) {
		return this.userService.getAccountById(account.getId());
	}

	@GetMapping(path = "/all")
	@Operation(summary = "Get all users")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Find all user account")
	})
	public List<AccountDto> getAllUserAccount() {
		return this.userService.getAllUserAccount();
	}

	@PostMapping
	@Operation(summary = "Create a new user.")
	@ApiResponses(value = {
			@ApiResponse(description= "User creation", content =  {
					@Content(schema = @Schema(implementation = String.class))
			})
	})
	public ResponseMessage createUser(@RequestBody AccountDto userPayload, AccountTokenDto account) {
		this.userService.createUser(userPayload, account.getId());
		return new ResponseMessage("L'utilisateur a été créé avec succès.");
	}

	@PutMapping()
	@Operation(summary = "Update the user data")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "User data is updated")
	})
	public ResponseMessage updateUser(AccountTokenDto account, @RequestBody AccountDto savingAccount) {
		userService.updateUser(savingAccount, account.getId());
		return new ResponseMessage("L'utilisateur a été modifié avec succès.");
	}

	@GetMapping(path = "/{id}")
	@Operation(summary = "Get the user details.")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Find all user details, includes perimeters and information.")
	})
	public AccountDto getAccountById(
		@PathVariable Long id
	) {
		return this.userService.getAccountById(id);
	}

	@DeleteMapping(path = "/{id}")
	@Operation(summary = "Delete the user. Return a response message.")
	@ApiResponses(value = {
		@ApiResponse(description= "A response message", content =  {
				@Content(schema = @Schema(implementation = String.class))
		})
	})
	public ResponseMessage deleteUser(
			@PathVariable Long id,
			AccountTokenDto account
	) {
		this.userService.deleteUser(id, account.getId());
		return new ResponseMessage("L'utilisateur a été supprimé avec succès.");
	}
}
