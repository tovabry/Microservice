package se.whispers.resourceserver;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.Collections;
import java.util.List;


@RestController
public class HelloController {

    private static final Logger logger = LoggerFactory.getLogger(HelloController.class);

    @GetMapping("/private")
    public String privateEndpoint() {
        return "You're visiting the private endpoint of this resource server";
    }

    @GetMapping("/public")
    public String publicEndpoint(HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        int clientPort = request.getRemotePort();
        List<String> headerNames = Collections.list(request.getHeaderNames());

        logger.info("Client IP: " + clientIp + " Client Port: " + clientPort);
        logger.info("Request Headers: " + headerNames);
        logger.info("X-Forwarded-For: " + request.getRemoteHost());
        logger.info("X-Forwarded-Port: " + request.getRemotePort());
        return "You're visiting the public endpoint of this resource server";
    }

}
