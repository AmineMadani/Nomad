package com.veolia.nextcanope.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.userContextDto;
import com.veolia.nextcanope.model.AppUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.veolia.nextcanope.dto.AccountDto;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import java.util.Optional;

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



	@PutMapping (path ="/user-context/{id}")
	@Operation(summary = "Set the user context")
	@ApiResponses(value = {
		        @ApiResponse(responseCode = "200",description= "save the context in database")
	})
	public String putUserContext(@PathVariable("id") Long id, @RequestBody userContextDto userContextDto) throws Exception {
		ObjectMapper mapper = new ObjectMapper();
		Long _id = id;
		Optional<AppUser> appUser = userRepository.findById(_id);
		if (appUser.isEmpty())
		{
			throw new Exception("unknown user");
		}
		Jsonb jsonb = JsonbBuilder.create() ;
		String userContextJsonb = jsonb.toJson(userContextDto);
		appUser.get().setUserContext(userContextJsonb);
		userRepository.save(appUser.get());
		return appUser.get().getUserContext();
	}


	@GetMapping (path ="/user-context/{id}")
	@Operation(summary = "Get the user context")
	@ApiResponses(value = {
						@ApiResponse(responseCode = "200",description= "get the context from database")
	})
	public String getUserContext(@PathVariable("id") Long userId) throws Exception {
 		Optional<AppUser> appUser =userRepository.findById(userId);
		if (appUser.isEmpty())
		{
			throw new Exception("unknown user");
		}
		return appUser.get().getUserContext();
	}
}
