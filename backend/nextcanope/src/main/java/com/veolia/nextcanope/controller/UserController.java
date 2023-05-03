package com.veolia.nextcanope.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veolia.nextcanope.dto.UserContextDto;
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
	public void setUserContext(@PathVariable("id") Integer id, @RequestBody UserContextDto userContextDto) {
		ObjectMapper mapper = new ObjectMapper();
		Integer _id = id;
		AppUser appUser = userRepository.findById(1);
        Jsonb jsonb = JsonbBuilder.create() ;
		String userContextJsonb = jsonb.toJson(userContextDto);
		appUser.setUserContext(userContextJsonb);
		userRepository.save(appUser);
		return ;
	}

	@GetMapping (path ="/user-context/{id}")
	@Operation(summary = "Get the user context")
	@ApiResponses(value = {
						@ApiResponse(responseCode = "200",description= "get the context from database")
	})
	public String getUserContext(@PathVariable("id") int userId) {
		return userRepository.findUserContextById(userId).getUserContext();
	}
}
