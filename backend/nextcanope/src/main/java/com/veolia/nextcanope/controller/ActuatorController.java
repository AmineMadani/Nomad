package com.veolia.nextcanope.controller;

import java.util.HashMap;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
public class ActuatorController {

	@GetMapping(path = "/health")
	public HashMap<String, Object> health() {
		HashMap<String, Object> map = new HashMap<>();
		map.put("status server", "UP");
		map.put("status BDD", "UP");
		return map;
	}
}
