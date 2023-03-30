package com.veolia.nextcanope.configuration;

import java.io.IOException;

import org.springframework.stereotype.Component;

import com.veolia.nextcanope.dto.AccountTokenDto;

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
	    if(!account.getIsValid()) {
	    	((HttpServletResponse) response).sendError(HttpServletResponse.SC_UNAUTHORIZED, "Your are not authorized on this application");
	    } else {
	    	chain.doFilter(request, response);
	    }
	}

}
