package com.veolia.nextcanope.service;

import com.veolia.nextcanope.dto.PermissionDto;
import com.veolia.nextcanope.model.Permissions;
import com.veolia.nextcanope.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * PermissionService is a service class for managing asset-related data.
 * It interacts with the permissionRepository to access and manipulate the data.
 */
@Service
public class PermissionService {
    @Autowired
	PermissionRepository permissionRepository;

	/**
	 * Get the list of permission from the database
	 * It maps the permission list to a list of permission DTO
	 * @return the list of permission
	 */
	public List<PermissionDto> getAllPermissions() {
		List<Permissions> permissions = this.permissionRepository.findAll();

		return permissions.stream().map(PermissionDto::new).toList();
	}
}
