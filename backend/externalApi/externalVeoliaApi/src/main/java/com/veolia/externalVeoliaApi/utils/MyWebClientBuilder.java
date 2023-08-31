package com.veolia.externalVeoliaApi.utils;

import io.netty.channel.ChannelOption;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import org.apache.http.HttpHost;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.reactive.ClientHttpConnector;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.tcp.TcpClient;
import reactor.netty.transport.ProxyProvider;

import javax.net.ssl.SSLException;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.util.ArrayList;
import java.util.List;

@Component
public class MyWebClientBuilder {

    @Value("${https.proxyHost:#{null}}")
    String proxyHost;

    @Value("${https.proxyPort:#{null}}")
    Integer proxyPort;

    @Value("${req.timeout}")
    Integer reqTimeout;

    public  WebClient createWebClient(String url) throws SSLException {
        SslContext sslContext = SslContextBuilder
                .forClient()
                .trustManager(InsecureTrustManagerFactory.INSTANCE)
                .build();

        TcpClient tcpClient = TcpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, reqTimeout)
                .doOnConnected(connection ->
                        connection.addHandlerLast(new ReadTimeoutHandler(reqTimeout))
                                .addHandlerLast(new WriteTimeoutHandler(reqTimeout)));

        HttpClient httpClient = HttpClient.from(tcpClient)
                .secure(sslContextSpec -> sslContextSpec.sslContext(sslContext));

        if (proxyHost != null) {
            httpClient = httpClient.tcpConfiguration(tcpc ->
                    tcpc.proxy(proxy -> proxy.type(ProxyProvider.Proxy.HTTP).host(proxyHost).port(proxyPort)));
        }

        ClientHttpConnector connector = new ReactorClientHttpConnector(httpClient);

        ExchangeStrategies exchangeStrategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024 * 20)).build();

        return WebClient.builder().clientConnector(connector)
                .exchangeStrategies(exchangeStrategies)
                .baseUrl(url)
                .build();
    }

    public HttpPost createHttpPostAuth2(String url, String clientId, String clientSecret, Integer timeout) throws IOException {
        HttpPost httpPost = new HttpPost(url);
        RequestConfig.Builder builder = RequestConfig.custom();

        if (proxyHost != null && proxyPort != null) {
            builder.setProxy(new HttpHost(proxyHost, proxyPort));
        }

        if (reqTimeout != null) {
            builder.setConnectTimeout(reqTimeout);
        }

        httpPost.setConfig(builder.build());

        List<NameValuePair> urlParameters = new ArrayList<>();
        urlParameters.add(new BasicNameValuePair("grant_type", "client_credentials"));
        urlParameters.add(new BasicNameValuePair("client_id", clientId));
        urlParameters.add(new BasicNameValuePair("client_secret", clientSecret));
        httpPost.setEntity(new UrlEncodedFormEntity(urlParameters));

        // preemptive authentication
        HttpURLConnection connection = (HttpURLConnection) httpPost.getURI().toURL().openConnection();
        connection.setReadTimeout(timeout);
        connection.setConnectTimeout(timeout);

        return httpPost;
    }

    public org.apache.http.client.HttpClient createHttpClient() {
        return HttpClientBuilder.create().build();
    }

    public HttpGet createHttpGet(String url) {
        HttpGet rq = new HttpGet(url);
        RequestConfig.Builder builder = RequestConfig.custom();

        if (proxyHost != null && proxyPort != null) {
            builder.setProxy(new HttpHost(proxyHost, proxyPort));
        }

        if (reqTimeout != null) {
            builder.setConnectTimeout(reqTimeout);
        }

        rq.setConfig(builder.build());

        return rq;
    }
}
