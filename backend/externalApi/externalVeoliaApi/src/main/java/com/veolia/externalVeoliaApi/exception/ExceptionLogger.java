package com.veolia.externalVeoliaApi.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ExceptionLogger {
    private static final Logger logger = LoggerFactory.getLogger(ExceptionLogger.class);

    public void log(NomadException nomadException, HttpServletRequest request) {
        String messageToLog = String.format("%s : %s %s %d - %s",
                nomadException.getClass().getSimpleName(),
                request.getMethod(),
                request.getRequestURI(),
                nomadException.getStatus().value(),
                nomadException.getMessage()
        );

        if (nomadException instanceof FunctionalException) {
            logger.warn(messageToLog);
        } else {
            logger.error(messageToLog, nomadException);
        }
    }
}
