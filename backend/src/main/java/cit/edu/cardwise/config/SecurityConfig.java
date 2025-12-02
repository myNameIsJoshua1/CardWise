package cit.edu.cardwise.config;

import cit.edu.cardwise.security.JwtAuthenticationFilter;
import cit.edu.cardwise.service.UserService;
import cit.edu.cardwise.service.AdminService;
import cit.edu.cardwise.entity.UserEntity;
import cit.edu.cardwise.entity.AdminEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/").permitAll() // Add this line
                        .requestMatchers(HttpMethod.POST,
                                "/user/login",
                                "/admin/login",
                                "/user/google",
                                "/user/create",
                                "/user/forgot-password",
                                "/oauth/**"
                        ).permitAll()
                        .requestMatchers("/user/**","/deck/**").authenticated()
                        .anyRequest().authenticated()

                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    // Create the JwtAuthenticationFilter as a bean with its dependency
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(UserDetailsService userDetailsService) {
        return new JwtAuthenticationFilter(userDetailsService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:3000", "https://quizwhiz-five.vercel.app"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(UserService userService, AdminService adminService) {
        return username -> {
            Optional<UserEntity> userOpt = userService.findByEmail(username);
            if (userOpt.isPresent()) {
                UserEntity user = userOpt.get();
                return org.springframework.security.core.userdetails.User.builder()
                        .username(user.getEmail())
                        .password(user.getPassword() != null ? user.getPassword() : "")
                        .authorities("USER")
                        .build();
            }

            Optional<AdminEntity> adminOpt = adminService.findByEmail(username);
            if (adminOpt.isPresent()) {
                AdminEntity admin = adminOpt.get();
                return org.springframework.security.core.userdetails.User.builder()
                        .username(admin.getEmail())
                        .password(admin.getPassword() != null ? admin.getPassword() : "")
                        .authorities("ADMIN")
                        .build();
            }

            throw new UsernameNotFoundException("User not found with email: " + username);
        };
    }
}