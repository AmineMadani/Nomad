package com.veolia.nextcanope;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;;

@SpringBootApplication
@EnableAsync
public class NextcanopeApplication {

	public static void main(String[] args) {
		SpringApplication.run(NextcanopeApplication.class, args);
	}

}
