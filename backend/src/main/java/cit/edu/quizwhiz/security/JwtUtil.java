package cit.edu.quizwhiz.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String secret = "your-secret-key-that-is-long-enough";
    private final Key key = Keys.hmacShaKeyFor(secret.getBytes());
    private final long expiration = 1000 * 60 * 60 * 10; // 10 hours

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }


    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody().getSubject();
        } catch (JwtException e) {
            System.out.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        try {
            Date expirationDate = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody().getExpiration();
            return expirationDate.before(new Date());
        } catch (JwtException e) {
            System.out.println("Error checking token expiration: " + e.getMessage());
            return true;
        }
    }
}
