package com.veolia.nextcanope.dto;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class AccountTokenDto extends JwtAuthenticationToken  {

	private static final long serialVersionUID = 1L;

	private String email;
	
	private Boolean isValid;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Boolean getIsValid() {
		return isValid;
	}

	public void setIsValid(Boolean isValid) {
		this.isValid = isValid;
	}

	public AccountTokenDto(Jwt jwt, Collection<? extends GrantedAuthority> authorities, String name, String email, Boolean isValid) {
		super(jwt, authorities, name);
		this.email = email;
		this.isValid = isValid;
	}
}
