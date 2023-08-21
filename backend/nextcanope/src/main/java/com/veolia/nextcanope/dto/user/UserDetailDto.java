package com.veolia.nextcanope.dto.user;

import com.veolia.nextcanope.dto.Contract.ContractOrgDto;
import com.veolia.nextcanope.dto.Contract.ContractOrgProjectionDto;
import com.veolia.nextcanope.dto.OrganizationalUnitDto;
import com.veolia.nextcanope.model.Contract;
import com.veolia.nextcanope.model.Profile;
import com.veolia.nextcanope.model.Users;
import com.veolia.nextcanope.model.UsrCtrPrf;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UserDetailDto {

    private String lastName;

    private String firstName;

    private String email;

    private String status;

    private String company;

    private List<UserPerimeterDto> perimeters;

    public UserDetailDto() {
    }

    public UserDetailDto(Users user) {
        this.lastName = user.getUsrLastName();
        this.firstName = user.getUsrFirstName();
        this.email = user.getUsrEmail();
        this.status = user.getUsrStatus();
        this.company = user.getUsrCompany();

        List<UserPerimeterDto> userPerimeters = new ArrayList<>();
        user.getListOfUsrCtrPrf().stream()
                .collect(Collectors.groupingBy(UsrCtrPrf::getProfile))
                .forEach((Profile profile, List<UsrCtrPrf> usrCtrPrfList) -> {
                    UserPerimeterDto userPerimeterDto = new UserPerimeterDto();
                    // Profile
                    userPerimeterDto.setProfileId(profile.getId());
                    // Contracts
                    List<Long> contractIds = usrCtrPrfList.stream()
                            .map(e -> e.getContract().getId())
                            .toList();
                    userPerimeterDto.setContractIds(contractIds);

                    userPerimeters.add(userPerimeterDto);
                });
        this.perimeters = userPerimeters;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public List<UserPerimeterDto> getPerimeters() {
        return perimeters;
    }

    public void setPerimeters(List<UserPerimeterDto> perimeters) {
        this.perimeters = perimeters;
    }
}
