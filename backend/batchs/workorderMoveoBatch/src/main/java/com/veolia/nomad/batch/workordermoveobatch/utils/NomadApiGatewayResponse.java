package com.veolia.nomad.batch.workordermoveobatch.utils;

import com.amazonaws.http.HttpResponse;
import com.amazonaws.util.IOUtils;
import java.io.IOException;

public class NomadApiGatewayResponse {
    private final HttpResponse httpResponse;
    private final String body;

    public NomadApiGatewayResponse(HttpResponse httpResponse) throws IOException {
        this.httpResponse = httpResponse;
        if (httpResponse.getContent() != null) {
            this.body = IOUtils.toString(httpResponse.getContent());
        } else {
            this.body = null;
        }
    }

    public HttpResponse getHttpResponse() {
        return httpResponse;
    }

    public String getBody() {
        return body;
    }
}
