package se.whispers.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.function.HandlerFunction;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    RouterFunction<ServerResponse> routes() {
        return RouterFunctions.route()
                // Resource Server routes
                .GET("/api/**", HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://resourceserver:8080"))
                // Joke Service routes
                .GET("/jokes/**", HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://jokeservice:8082"))
                // Quote Service routes
                .GET("/quotes/**", HandlerFunctions.http())
                .before(BeforeFilterFunctions.uri("http://quoteservice:8083"))
                .build();
    }

}
