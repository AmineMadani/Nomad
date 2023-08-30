package com.veolia.externalVeoliaApi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ExternalVeoliaApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ExternalVeoliaApiApplication.class, args);
	}

}
