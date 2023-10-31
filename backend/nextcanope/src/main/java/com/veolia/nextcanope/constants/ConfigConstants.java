package com.veolia.nextcanope.constants;

public class ConfigConstants {
	
	/**
	 * List of url to bypass in filters
	 */
	public static final String[] FILTER_URL_IGNORE  = {"/health","/swagger-ui.html","/swagger-ui/**", "/v3/api-docs/**"};

	/**
	 * Label jwt
	 */
	public static final String LABEL_JWT  = "jwt";
	
	/**
	 * Label bearer
	 */
	public static final String LABEL_BEARER  = "bearer";

	/**
	 * Label bearer-key
	 */
	public static final String LABEL_BEARER_KEY  = "bearer-key";
	
	/**
	 * Label email
	 */
	public static final String LABEL_EMAIL  = "email";
	
	/**
	 * Label /**
	 */
	public static final String SYMBOL_SUB_URL  = "/**";

	/**
	 * Label /**
	 */
	public static final String SCHEMA  = "asset";

	/**
	 * Mail of the user used for external called (with basic auth)
	 */
	public static final String EXTERNAL_MAIL = "external@veolia.com";
}
