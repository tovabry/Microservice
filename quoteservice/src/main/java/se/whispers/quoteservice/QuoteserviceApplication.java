package se.whispers.quoteservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@SpringBootApplication
public class QuoteserviceApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuoteserviceApplication.class, args);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) //enable CORS
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("quotes/public").permitAll()
                        .requestMatchers("quotes/private").hasAuthority("SCOPE_read_resource")
                        .anyRequest().authenticated()
                )
                //turn on resource server that looks for JWT tokens, with default configuration
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configurationSource = new CorsConfiguration();
        //these are preflight requests
        configurationSource.addAllowedOrigin("http://localhost:7000"); //who can access my API, unauthorized domains can't access (7000 is api)
        configurationSource.addAllowedMethod("*"); //wich method can be used by the client
        configurationSource.addAllowedHeader("*"); //which headers can be sent
        configurationSource.addExposedHeader("*"); //which headers can be exposed to the client
        configurationSource.setAllowCredentials(true); //allow credentials to be sent
        configurationSource.setMaxAge(3600L); // 1 hour long browser cache for CORS preflight requests
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configurationSource);
        return source;
    }

}
