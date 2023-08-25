package com.veolia.nextcanope.dto.account;

import com.veolia.nextcanope.model.Profile;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.model.UsrCtrPrf;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

	private List<AccountPerimeterDto> perimeters;

	public AccountDto() {
		super();
	}

	public AccountDto(Users user) {
		this.id = user.getId();
		this.email = user.getUsrEmail();
		this.firstName = user.getUsrFirstName();
		this.lastName = user.getUsrLastName();
		this.isValid = user.getUsrValid();
		this.status = user.getUsrStatus();
		this.company = user.getUsrCompany();
		this.usrConfiguration = user.getUsrConfiguration();
		// Perimeter info
		List<AccountPerimeterDto> userPerimeters = new ArrayList<>();
		user.getListOfUsrCtrPrf().stream()
				// We group contracts by profile
				.collect(Collectors.groupingBy(UsrCtrPrf::getProfile))
				.forEach((Profile profile, List<UsrCtrPrf> usrCtrPrfList) -> {
					AccountPerimeterDto accountPerimeterDto = new AccountPerimeterDto();
					// Profile
					accountPerimeterDto.setProfileId(profile.getId());
					// Contracts
					List<Long> contractIds = usrCtrPrfList.stream()
							.map(e -> e.getContract().getId())
							.toList();
					accountPerimeterDto.setContractIds(contractIds);

					userPerimeters.add(accountPerimeterDto);
				});
		this.perimeters = userPerimeters;
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

	public List<AccountPerimeterDto> getPerimeters() {
		return perimeters;
	}

	public void setPerimeters(List<AccountPerimeterDto> perimeters) {
		this.perimeters = perimeters;
	}
}
