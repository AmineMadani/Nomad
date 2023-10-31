package com.veolia.externalVeoliaApi.exception;

import org.springframework.http.HttpStatus;

public class FunctionalException extends NomadException {

	private static final long serialVersionUID = 1L;

	public FunctionalException(String responseMessage) {
        super(HttpStatus.BAD_REQUEST.getReasonPhrase());

        this.status = HttpStatus.BAD_REQUEST;
        this.responseMessage = responseMessage;
    }

    public FunctionalException(String responseMessage, String errorMessage) {
        super(errorMessage);

        this.status = HttpStatus.BAD_REQUEST;
        this.responseMessage = responseMessage;
    }
}

