package com.veolia.nextcanope.configuration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * Classe permettant de logguer toutes les requêtes entrante et sortante du service web
 */
public class ControllerLogger implements HandlerInterceptor {
	
	/**
	 * LOGGER
	 */
    private static final Logger logger = LoggerFactory.getLogger(ControllerLogger.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String requestId = UUID.randomUUID().toString();
        logger.info("requestId {}, host {}  HttpMethod: {}, URI : {}", requestId, request.getHeader("host"),
                request.getMethod(), request.getRequestURI());
        long startTime = System.currentTimeMillis();
        request.setAttribute("startTime", startTime);
        request.setAttribute("requestId", requestId);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        //super.afterCompletion(request, response, handler, ex);
        long startTime = (Long) request.getAttribute("startTime");
        long endTime = System.currentTimeMillis();
        long executeTime = endTime - startTime;
        logger.info("requestId : {}, Handle : {}, time taken : {}", request.getAttribute("requestId"), handler, executeTime);
    }
}