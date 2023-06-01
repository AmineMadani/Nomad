package com.veolia.nextcanope.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.UserContextDto;
import com.veolia.nextcanope.model.AppUser;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.repository.UserRepository;
import java.util.Optional;

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

	@GetMapping(path = "/information")
	@Operation(summary = "Get the user information")
	@ApiResponses(value = {
			@ApiResponse(responseCode = "200",description= "Account based on the token and the database")
			})
	public AccountDto getUserInformation(AccountTokenDto account) {
		return new AccountDto(account);
	};



	@PutMapping(path ="/user-context/{id}")
	@Operation(summary = "Set the user context")
	@ApiResponses(value = {
		        @ApiResponse(responseCode = "200",description= "save the context in database")
	})
	public String putUserContext(@PathVariable("id") Long idInput, @RequestBody UserContextDto userContextDto) throws Exception {
		Long id = idInput;
		Optional<AppUser> appUser = userRepository.findById(id);
		ObjectMapper mapper = new ObjectMapper();
		if (appUser.isEmpty())
		{
			throw new Exception("unknown user");
		}
		String t = mapper.writeValueAsString(appUser.get().getUserContext());
		appUser.get().setUserContext(mapper.writeValueAsString(userContextDto));

		userRepository.save(appUser.get());
		return appUser.get().getUserContext();
	}

}
