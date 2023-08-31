package com.veolia.externalVeoliaApi.configuration;

import com.veolia.externalVeoliaApi.constants.ConfigConstants;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@ConditionalOnProperty(name = "keycloak.enabled", havingValue = "true")
public class SecurityConfig {
	
	/**
	 * Method to convert the original token to a custom one
	 * @return the custom token
	 */
	@Bean
    public Converter<Jwt,AbstractAuthenticationToken> customJwtAuthenticationConverter() {
        return new CustomJwtAuthenticationConverter();
    }

	/**
	 * Custom filter to check all request with the keycloak authentification 
	 * and convert the valid token to a custom one
	 * @param http Incoming http
	 * @return Outgoing http
	 * @throws Exception Errors
	 */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    	
    	http.cors()
        .and()
        .authorizeHttpRequests()
        .anyRequest()
        .authenticated()
        .and()
        .oauth2ResourceServer()
        .jwt().jwtAuthenticationConverter(customJwtAuthenticationConverter());
    	 
        return http.build();
    }
    
    /**
     * Method to bypass the security filter
     * @return The custome web
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(ConfigConstants.FILTER_URL_IGNORE);
    }
}