package com.veolia.nextcanope.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import com.veolia.nextcanope.constants.ConfigConstants;
import com.veolia.nextcanope.repository.UserRepository;

import java.util.Base64;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Value("${basic.autorizedAccounts}")
	String basicAutorizedAccounts;

	/**
	 * Method to bypass the security filter
	 * @return The custome web
	 */
	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		return (web) -> web.ignoring().requestMatchers(ConfigConstants.FILTER_URL_IGNORE);
	}

	@Bean
	@Order(1)
	SecurityFilterChain basicSecurityFilterChain(HttpSecurity http) throws Exception {
		http.cors().and().csrf().disable()
				.securityMatcher("/basic/**")
				.authorizeHttpRequests(auth -> {
					auth.anyRequest().authenticated();
				})
				.httpBasic();

		return http.build();
	}

	@Bean
	public UserDetailsService userDetailsService() {
		String autorizedAccount = new String(Base64.getDecoder().decode(basicAutorizedAccounts));
		String[] autorizedAccountSplit = autorizedAccount.split(":");

		InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
		if (autorizedAccountSplit.length > 1) {
			String username = autorizedAccountSplit[0];
			String password = autorizedAccountSplit[1];
			manager.createUser(User.withDefaultPasswordEncoder().username(username).password(password).roles("ADMIN").build());
		}
		return manager;
	}

	@Bean
	@Order(2)
	@ConditionalOnProperty(name = "keycloak.enabled", havingValue = "true")
	SecurityFilterChain keycloackSecurityFilterChain(HttpSecurity http) throws Exception {
		http.cors().and()
				.authorizeHttpRequests( auth -> {
					auth.anyRequest().authenticated();
				})
				.oauth2ResourceServer()
				.jwt().jwtAuthenticationConverter(customJwtAuthenticationConverter());

		return http.build();
	}

	@Autowired
	UserRepository userRepository;

	/**
	 * Method to convert the original token to a custom one
	 * @return the custom token
	 */
	@Bean
	public Converter<Jwt,AbstractAuthenticationToken> customJwtAuthenticationConverter() {
		return new CustomJwtAuthenticationConverter(userRepository);
	}
}