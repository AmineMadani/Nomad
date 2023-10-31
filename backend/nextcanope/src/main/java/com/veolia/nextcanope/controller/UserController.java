package com.veolia.nextcanope.controller;

import java.util.List;

import com.veolia.nextcanope.dto.PermissionDto;
import com.veolia.nextcanope.dto.ProfileDto;
import com.veolia.nextcanope.dto.UserStatusDto;
import com.veolia.nextcanope.service.PermissionService;
import com.veolia.nextcanope.service.ProfileService;
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
@RequestMapping("/users")
@Tag(name = "User Management System", description = "Operations pertaining to user in the User Management System")
public class UserController {

	@Autowired
	UserRepository userRepository;

	@Autowired
	UserService userService;

	@Autowired
	public PermissionService permissionService;

	@Autowired
	public ProfileService profileService;

	@GetMapping(path = "/current")
	@Operation(summary = "Get the current user")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Account based on the token and the database")
	})
	public AccountDto getUserInformation(AccountTokenDto account) {
		return this.userService.getAccountById(account.getId());
	}

	@GetMapping()
	@Operation(summary = "Get all users")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Find all user account")
	})
	public List<AccountDto> getAllUserAccount() {
		return this.userService.getAllUserAccount();
	}

	@PostMapping(path = "create")
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

	@PutMapping(path = "{userId}/update")
	@Operation(summary = "Update the user data")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "200",description= "User data is updated")
	})
	public ResponseMessage updateUser(
			AccountTokenDto account,
			@RequestBody AccountDto savingAccount,
			@PathVariable Long userId
	) {
		userService.updateUser(userId, savingAccount, account.getId());
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

	@DeleteMapping("delete")
	@Operation(summary = "Delete a list of user. Return a response message.")
	@ApiResponses(value = {
		@ApiResponse(description= "A response message", content =  {
				@Content(schema = @Schema(implementation = String.class))
		})
	})
	public ResponseMessage deleteUsers(
			@RequestParam List<Long> userIds,
			AccountTokenDto account
	) {
		this.userService.deleteUsers(userIds, account.getId());
		return new ResponseMessage("Le ou les utilisateurs ont été supprimé(s) avec succès.");
	}

	@GetMapping(path= "/permissions")
	@Operation(summary = "Get the list of permissions")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "The permission list")
	})
	public List<PermissionDto> getAllPermissions() {
		return this.permissionService.getAllPermissions();
	}

	@GetMapping(path= "/profiles")
	@Operation(summary = "Get the list of profile")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "The profile list")
	})
	public List<ProfileDto> getAllProfiles() {
		return this.profileService.getAllProfiles();
	}

	@GetMapping(path = "/status")
	@Operation(summary = "Get the current user status by email (deleted or not)")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "The current user status by email (deleted or not)")
	})
	public UserStatusDto getUserStatusByEmail(@RequestParam String email) {
		return this.userService.getUserStatusByEmail(email);
	}
}
