package com.veolia.externalVeoliaApi.configuration;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import com.veolia.externalVeoliaApi.constants.ConfigConstants;
import com.veolia.externalVeoliaApi.dto.account.AccountTokenDto;

/**
 * This class is used to generate a custom token object
 */
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

	public CustomJwtAuthenticationConverter() {
		super();
	}

	@Override
	public AbstractAuthenticationToken convert(Jwt source) {
		String principalClaimValue = source.getClaimAsString(ConfigConstants.LABEL_EMAIL);
        return new AccountTokenDto(source,null);
	}

}
