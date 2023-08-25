package com.veolia.nextcanope.configuration;

import java.io.IOException;
import java.util.Arrays;

import org.springframework.stereotype.Component;

import com.veolia.nextcanope.constants.ConfigConstants;
import com.veolia.nextcanope.constants.MessageConstants;
import com.veolia.nextcanope.dto.account.AccountTokenDto;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * This filter is used to check if request can be authorized
 */
@Component
public class ControllerFilter implements Filter {
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
	    AccountTokenDto account = (AccountTokenDto) req.getUserPrincipal();
	    req.getRequestURI();
	    if(!Arrays.stream(transcoUrlFilterArray(ConfigConstants.FILTER_URL_IGNORE)).anyMatch(req.getRequestURI()::contains) && (account == null || !account.getIsValid())) {
	    	((HttpServletResponse) response).sendError(HttpServletResponse.SC_UNAUTHORIZED, MessageConstants.ERROR_NOT_AUTHORIZED);
	    } else {
	    	chain.doFilter(request, response);
	    }
	}
	
	/**
	 * Transcode an array in order to remove the /** part of a string
	 * @param in The array to trancode
	 * @return The array transcoded
	 */
	private String[] transcoUrlFilterArray(String[] in) {
		return Arrays.stream(in).map(item -> item.replace(ConfigConstants.SYMBOL_SUB_URL, "")).toArray(String[]::new);
	}

}
