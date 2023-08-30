package com.veolia.externalVeoliaApi.dto.account;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class AccountTokenDto extends JwtAuthenticationToken  {

	private static final long serialVersionUID = 1L;

	private String email;
	
	private String firstName;
	
	private String lastName;
	
	private String imgUrl;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getImgUrl() {
		return imgUrl;
	}

	public void setImgUrl(String imgUrl) {
		this.imgUrl = imgUrl;
	}

	public AccountTokenDto(Jwt jwt, Collection<? extends GrantedAuthority> authorities) {
		super(jwt, authorities, jwt.getClaimAsString("email"));
		this.email = jwt.getClaimAsString("email");
		this.firstName = jwt.getClaimAsString("given_name");
		this.lastName = jwt.getClaimAsString("family_name");
		this.imgUrl = jwt.getClaimAsString("picture");
	}
}
