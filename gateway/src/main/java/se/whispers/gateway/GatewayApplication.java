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

//    @Bean
//    RouterFunction<ServerResponse> routes() {
//        return RouterFunctions.route()
//                .GET("/api/get", HandlerFunctions.http()) //creates a GET endpoint and uses HandlerFunctions.http() to forward request to downstream services
//                .before(BeforeFilterFunctions.uri("http://example.org")) //sets the URI to forward requests to
//                .build();
//    }

}
