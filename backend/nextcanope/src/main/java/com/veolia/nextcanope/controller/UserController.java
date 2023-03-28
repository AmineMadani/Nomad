package com.veolia.nextcanope.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.model.AppUser;
import com.veolia.nextcanope.repository.UserRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/user")
public class UserController {
	
	@Autowired
	UserRepository userRepository;
		
	@GetMapping(path = "/information")
	public Map<String,Object> getUserInformation(AccountTokenDto principal) {
		System.out.println(principal);
		return principal.getToken().getClaims();
	}
	
	@GetMapping(path = "/list")
	public List<AppUser> getListUser() {
		return userRepository.findAll();
	}
	
}
