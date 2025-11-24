package cit.edu.cardwise.security;

import org.springframework.stereotype.Component;

/**
 * Stubbed GoogleTokenVerifier: Google OAuth has been removed. This class remains
 * as a no-op placeholder to avoid compile errors in remaining code that may
 * reference it. It always returns null.
 */
@Component
public class GoogleTokenVerifier {
    public java.util.Map<String, Object> verifyGoogleIdToken(String idTokenString) {
        return null;
    }
}