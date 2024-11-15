package com.veolia.nextcanope.dto.account;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import com.veolia.nextcanope.model.Users;

public class AccountTokenDto extends JwtAuthenticationToken  {

	private static final long serialVersionUID = 1L;
	
	private Long id;

	private String email;
	
	private String firstName;
	
	private String lastName;
	
	private String imgUrl;
	
	private Boolean isValid = false;
	
	private String usrConfiguration;

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

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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
	
	public String getUsrConfiguration() {
		return usrConfiguration;
	}

	public void setUsrConfiguration(String usrConfiguration) {
		this.usrConfiguration = usrConfiguration;
	}

	public AccountTokenDto(Jwt jwt, Collection<? extends GrantedAuthority> authorities, Users user) {
		super(jwt, authorities, jwt.getClaimAsString("email"));
		this.email = jwt.getClaimAsString("email");
		this.firstName = jwt.getClaimAsString("given_name");
		this.lastName = jwt.getClaimAsString("family_name");
		this.imgUrl = jwt.getClaimAsString("picture");
		if(user != null) {
			this.id = user.getId();
			this.isValid = user.getUsrValid();
			this.usrConfiguration = user.getUsrConfiguration();
		}
	}
}
