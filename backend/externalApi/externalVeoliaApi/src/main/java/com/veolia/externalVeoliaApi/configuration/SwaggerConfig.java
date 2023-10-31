package com.veolia.externalVeoliaApi.configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.veolia.externalVeoliaApi.constants.ConfigConstants;

@Configuration
@OpenAPIDefinition(security = {@SecurityRequirement(name = "bearer-key")})
public class SwaggerConfig {

	/**
	 * Swagger configuration
	 * @return Custom API configuration
	 */
    @Bean
    public OpenApiCustomizer customerGlobalHeaderOpenApiCustomiser() {
        return openApi -> openApi.getComponents()
            .addSecuritySchemes(ConfigConstants.LABEL_BEARER_KEY,
                new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme(ConfigConstants.LABEL_BEARER).bearerFormat(ConfigConstants.LABEL_JWT));
    }
}
