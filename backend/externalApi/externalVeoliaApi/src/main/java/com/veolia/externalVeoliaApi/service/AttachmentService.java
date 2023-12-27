package com.veolia.externalVeoliaApi.service;

import com.veolia.externalVeoliaApi.dto.attachment.AttachmentDto;
import com.veolia.externalVeoliaApi.exception.FunctionalException;
import com.veolia.externalVeoliaApi.utils.MyWebClientBuilder;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.net.ssl.SSLException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;

@Service
public class AttachmentService {

    @Value("${api.doc.url}")
    String apiDocUrl;

    @Value("${api.doc.user}")
    String apiDocUser;

    @Value("${api.doc.pwd}")
    String apiDocPwd;

    @Value("${req.timeout}")
    int reqTimeout;

    @Autowired
    MyWebClientBuilder myWebClientBuilder;

    public List<AttachmentDto> getListAttachment(JSONObject jsonObj) throws SSLException {
        WebClient client = myWebClientBuilder.createWebClient(apiDocUrl + "/query");

        HashMap<String, Object> mapResponse = client.post()
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Authorization", "Basic "
                        + Base64.getEncoder().encodeToString((apiDocUser+":"+apiDocPwd).getBytes()))
                .body(Mono.just(jsonObj.toString()), String.class)
                .exchange()
                .flatMap(response -> response.toEntity(String.class))
                .flatMap(res -> {
                    HashMap<String, Object> response = new HashMap<>();
                    response.put("httpcode", res.getStatusCodeValue());
                    response.put("content", res.getBody());
                    return Mono.just(response);
                })
                .block();

        if (mapResponse == null) {
            throw new FunctionalException("Une erreur est survenue");
        }

        int httpcode = Integer.parseInt(mapResponse.get("httpcode").toString());

        if (httpcode != 200) {
            throw new FunctionalException("Retour HTTP non OK : " + httpcode);
        }

        JSONObject response = new JSONObject(mapResponse.get("content").toString());
        if (response.get("statusCode") == null || Integer.parseInt(response.get("statusCode").toString()) != 200) {
            throw new FunctionalException("Retour WebService non OK : " + response.get("statusCode"));
        }

        JSONObject body = response.getJSONObject("body");
        JSONArray documents = body.getJSONArray("documents");

        List<AttachmentDto> listAttachment = new ArrayList<>();

        for (Object documentObject : documents.toList()) {
            HashMap document = (HashMap) documentObject;

            AttachmentDto attachmentDto = new AttachmentDto();
            attachmentDto.setId((String) document.get("document_id"));
            attachmentDto.setUrl((String) document.get("download_url"));
            attachmentDto.setInformations((HashMap<String, Object>) document.get("document_information"));
            listAttachment.add(attachmentDto);
        }

        return listAttachment;
    }

    public AttachmentDto getAttachmentById(String id) throws SSLException {

        WebClient client = myWebClientBuilder.createWebClient(apiDocUrl + "?doc_id=");

        HashMap<String, Object> mapResponse = client.get()
                .uri(uriBuilder -> uriBuilder
                        .queryParam("doc_id", id)
                        .build())
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Authorization", "Basic "
                        + Base64.getEncoder().encodeToString((apiDocUser+":"+apiDocPwd).getBytes()))
                .exchange()
                .flatMap(response -> response.toEntity(String.class))
                .flatMap(res -> {
                    HashMap<String, Object> response = new HashMap<>();
                    response.put("httpcode", res.getStatusCodeValue());
                    response.put("content", res.getBody());
                    return Mono.just(response);
                })
                .block();

        if (mapResponse == null) {
            throw new FunctionalException("Une erreur est survenue");
        }

        int httpcode = Integer.parseInt(mapResponse.get("httpcode").toString());

        if (httpcode != 200) {
            throw new FunctionalException("Retour HTTP non OK : " + httpcode);
        }

        JSONObject response = new JSONObject(mapResponse.get("content").toString());
        if (response.get("statusCode") == null || Integer.parseInt(response.get("statusCode").toString()) != 200) {
            throw new FunctionalException("Retour WebService non OK : " + response.get("statusCode"));
        }

        JSONObject body = response.getJSONObject("body");

        AttachmentDto attachmentDto = new AttachmentDto();
        attachmentDto.setId((String) body.get("document_id"));
        attachmentDto.setUrl((String) body.get("download_url"));
        attachmentDto.setInformations(((JSONObject) body.get("document_information")).toMap());
        return attachmentDto;
    }

    public AttachmentDto createAttachment(JSONObject jsonObj, MultipartFile file) throws SSLException {
        WebClient client = myWebClientBuilder.createWebClient(apiDocUrl);
        jsonObj.put("filename", file.getOriginalFilename());
        jsonObj.put("filesize", file.getSize());

        // Get the url to which upload the file
        JSONObject mapResponse = client.post()
                .header("Content-Type", "application/json;charset=UTF-8")
                .header("Authorization", "Basic "
                        + Base64.getEncoder().encodeToString((apiDocUser+":"+apiDocPwd).getBytes()))
                .body(Mono.just(jsonObj.toString()), String.class)
                .exchange()
                .flatMap(response -> response.toEntity(String.class))
                .flatMap(res -> {
                    JSONObject response = new JSONObject();
                    response.put("httpcode", res.getStatusCodeValue());
                    response.put("content", res.getBody());
                    return Mono.just(response);
                })
                .block();

        if (mapResponse == null) {
            throw new FunctionalException("Une erreur est survenue");
        }

        int httpcode = Integer.parseInt(mapResponse.get("httpcode").toString());

        if (httpcode != 200) {
            throw new FunctionalException("Retour HTTP non OK : " + httpcode);
        }

        JSONObject response = new JSONObject(mapResponse.get("content").toString());
        if (response.get("statusCode") == null || Integer.parseInt(response.get("statusCode").toString()) != 200) {
            throw new FunctionalException("Retour WebService non OK : " + response.get("statusCode"));
        }

        JSONObject body = response.getJSONObject("body");
        String uploadUrl = body.getString("upload_url");

        // Upload the file (no immediate response)
        client.put()
                .uri(uploadUrl)
                .body(BodyInserters.fromResource(file.getResource()))
                .retrieve()
                .bodyToMono(JSONObject.class)
                .block();

        AttachmentDto attachmentDto = new AttachmentDto();
        attachmentDto.setId((String) body.get("document_id"));
        return attachmentDto;
    }
}
