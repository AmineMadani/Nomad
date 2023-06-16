package com.veolia.nomad.batch.workordermoveobatch.utils;

import com.amazonaws.AmazonServiceException;

public class NomadApiGatewayException extends AmazonServiceException {

	private static final long serialVersionUID = 1L;

	public NomadApiGatewayException(String errorMessage) {
        super(errorMessage);
    }

    public NomadApiGatewayException(String errorMessage, Exception cause) {
        super(errorMessage, cause);
    }
}
