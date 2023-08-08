package com.veolia.nextcanope.dto;

import com.veolia.nextcanope.model.Users;

public class AccountDto {
	
	private Long id;

	private String email;
	
	private String firstName;
	
	private String lastName;
	
	private String imgUrl;
	
	private Boolean isValid = false;
	
	private String usrConfiguration;

	private String status;

	private String company;

	public AccountDto() {
		super();
	}

	public AccountDto(AccountTokenDto accountTokenDto) {
		super();
		this.email=accountTokenDto.getEmail();
		this.firstName=accountTokenDto.getFirstName();
		this.id=accountTokenDto.getId();
		this.imgUrl=accountTokenDto.getImgUrl();
		this.isValid=accountTokenDto.getIsValid();
		this.lastName=accountTokenDto.getLastName();
		this.usrConfiguration = accountTokenDto.getUsrConfiguration();
	}

	public AccountDto(Users user) {
		this.id = user.getId();
		this.email = user.getUsrEmail();
		this.firstName = user.getUsrFirstName();
		this.lastName = user.getUsrLastName();
		this.isValid = user.getUsrValid();
		this.status = user.getUsrStatus();
		this.company = user.getUsrCompany();
	}

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
	
	public String getUsrConfiguration() {
		return usrConfiguration;
	}

	public void setUsrConfiguration(String usrConfiguration) {
		this.usrConfiguration = usrConfiguration;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}
}
