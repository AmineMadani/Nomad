package com.veolia.nextcanope.configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import com.veolia.nextcanope.constants.ConfigConstants;
import com.veolia.nextcanope.dto.AccountTokenDto;
import com.veolia.nextcanope.model.AppUser;
import com.veolia.nextcanope.repository.UserRepository;

/**
 * This class is used to generate a custom token object
 */
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
	
	private UserRepository userRepository;

	public CustomJwtAuthenticationConverter(UserRepository userRepository) {
		super();
		this.userRepository = userRepository;
	}

	@Override
	public AbstractAuthenticationToken convert(Jwt source) {
		String principalClaimValue = source.getClaimAsString(ConfigConstants.LABEL_EMAIL);
        AppUser user = userRepository.findByEmail(principalClaimValue);
        return new AccountTokenDto(source,null,user);
	}

}
