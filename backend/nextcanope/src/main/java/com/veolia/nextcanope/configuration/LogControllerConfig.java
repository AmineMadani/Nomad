package com.veolia.nextcanope.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Classe de surchage des configurations des logs
 */
@Configuration
public class LogControllerConfig implements WebMvcConfigurer {
	
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new ControllerLogger()).addPathPatterns("/**").excludePathPatterns("/health", "/health/");
    }
}