package com.veolia.nextcanope.dto;

import com.fasterxml.jackson.annotation.JsonRawValue;

public class AccountDto {
	
	private Long id;

	private String email;
	
	private String firstName;
	
	private String lastName;
	
	private String imgUrl;
	
	private Boolean isValid = false;
	@JsonRawValue
	private String userContext;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

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

	public Boolean getIsValid() {
		return isValid;
	}

	public void setIsValid(Boolean isValid) {
		this.isValid = isValid;
	}


	public  String getUserContext() { return userContext;}
	public  void setUserContext(String userContext) { this.userContext = userContext;}

	public AccountDto(AccountTokenDto accountTokenDto) {
		super();
		this.email=accountTokenDto.getEmail();
		this.firstName=accountTokenDto.getFirstName();
		this.id=accountTokenDto.getId();
		this.imgUrl=accountTokenDto.getImgUrl();
		this.isValid=accountTokenDto.getIsValid();
		this.lastName=accountTokenDto.getLastName();
		this.userContext = accountTokenDto.getUserContext();
	}
}
