package com.veolia.externalVeoliaApi.exception;

import org.springframework.http.HttpStatus;

public class TechnicalException extends NomadException {

	private static final long serialVersionUID = 1L;
	
	private final HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    public TechnicalException(String errorMessage) {
        super(errorMessage);
        this.status = httpStatus;
        this.responseMessage = "Erreur interne. Veuillez réessayer plus tard.";
    }

    public TechnicalException(String responseMessage, String errorMessage) {
        super(errorMessage);
        this.status = httpStatus;
        this.responseMessage = responseMessage;
    }
}

