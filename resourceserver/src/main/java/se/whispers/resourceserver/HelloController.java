package se.whispers.resourceserver;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/private")
    public String privateEndpoint() {
        return "You're visiting the private endpoint of this resource server";
    }

    @GetMapping("/public")
    public String publicEndpoint() {
        return "You're visiting the public endpoint of this resource server";
    }

}
