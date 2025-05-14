package se.whispers.resourceserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@SpringBootApplication
public class ResourceserverApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResourceserverApplication.class, args);
    }


    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) //enable CORS
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/public").permitAll()
                        .requestMatchers("/private").hasAuthority("SCOPE_read_resource")
                        .anyRequest().authenticated()
                )
                //turn on resource server that looks for JWT tokens, with default configuration
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

}
