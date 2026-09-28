package com.jobtracker.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductionConfigValidatorTest {

    private static final String DEV_SECRET =
            "c2FrdGhpLWpvYnRyYWNrLXN1cGVyLXNlY3JldC1rZXktY2hhbmdlLW1lLWluLXByb2R1Y3Rpb24tMjAyNg==";

    private static void validate(String profile, String jwtSecret, String corsOrigins) {
        MockEnvironment env = new MockEnvironment();
        if (profile != null) {
            env.setActiveProfiles(profile);
        }
        env.setProperty("jwt.secret", jwtSecret);
        env.setProperty("app.cors.allowed-origins", corsOrigins);
        env.setProperty("app.seed.enabled", "false");

        new ProductionConfigValidator(env).afterPropertiesSet();
    }

    @Test
    void acceptsACompleteProductionConfig() {
        assertDoesNotThrow(() -> validate("prod", "aW50ZW5zaXZlLXNlY3JldC0xMjM0NTY3ODkwYWJjZGVmZ2hpamtsbW5vcA==",
                "https://jobtrack.vercel.app"));
    }

    @Test
    void rejectsAMissingJwtSecret() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> validate("prod", "", "https://jobtrack.vercel.app"));

        assertTrue(error.getMessage().contains("JWT_SECRET is not set"));
    }

    @Test
    void rejectsTheBundledDevelopmentJwtSecret() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> validate("prod", DEV_SECRET, "https://jobtrack.vercel.app"));

        assertTrue(error.getMessage().contains("forge tokens"));
    }

    @Test
    void rejectsMissingCorsOrigins() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> validate("prod", "c29tZS1vdGhlci1zZWNyZXQtdmFsdWU=", ""));

        assertTrue(error.getMessage().contains("CORS_ORIGINS is not set"));
    }

    @Test
    void rejectsAWildcardCorsOrigin() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> validate("prod", "c29tZS1vdGhlci1zZWNyZXQtdmFsdWU=", "https://a.app, *"));

        assertTrue(error.getMessage().contains("'*'"));
    }

    @Test
    void allowsWildcardSubdomains() {
        assertDoesNotThrow(() -> validate("prod", "c29tZS1vdGhlci1zZWNyZXQtdmFsdWU=",
                "https://*.vercel.app, https://jobtrack.netlify.app"));
    }

    @Test
    void ignoresEverythingOutsideProduction() {
        assertDoesNotThrow(() -> validate(null, "", ""));
    }
}
