package com.jobtracker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Fails fast on the misconfigurations that are easy to miss on a hosted
 * deployment and are not caught until someone reports a bug: a demo JWT key in
 * production, an open CORS policy, or no allowed origins at all.
 *
 * Only active under the {@code prod} profile.
 */
@Component
public class ProductionConfigValidator implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(ProductionConfigValidator.class);

    private static final String DEV_JWT_SECRET =
            "c2FrdGhpLWpvYnRyYWNrLXN1cGVyLXNlY3JldC1rZXktY2hhbmdlLW1lLWluLXByb2R1Y3Rpb24tMjAyNg==";

    private final Environment env;

    public ProductionConfigValidator(Environment env) {
        this.env = env;
    }

    @Override
    public void afterPropertiesSet() {
        if (!env.acceptsProfiles(Profiles.of("prod"))) {
            return;
        }

        List<String> problems = new ArrayList<>();

        String jwtSecret = env.getProperty("jwt.secret", "");
        if (!StringUtils.hasText(jwtSecret)) {
            problems.add("JWT_SECRET is not set. Generate one with: openssl rand -base64 48");
        } else if (jwtSecret.trim().equals(DEV_JWT_SECRET)) {
            problems.add("JWT_SECRET is still the bundled development value. Anyone can forge tokens.");
        }

        List<String> origins = allowedOrigins();
        if (origins.isEmpty()) {
            problems.add("CORS_ORIGINS is not set. Set it to the deployed frontend origin, "
                    + "e.g. https://your-app.vercel.app");
        } else if (origins.contains("*")) {
            problems.add("CORS_ORIGINS contains '*'. Credentials are allowed, so this must be the "
                    + "explicit frontend origin instead.");
        }

        if (!problems.isEmpty()) {
            throw new IllegalStateException("Refusing to start with an unsafe production config: "
                    + String.join(" ", problems));
        }

        if (env.getProperty("app.seed.enabled", Boolean.class, false)) {
            log.warn("SEED_ENABLED is true in production: the public demo account "
                    + "(demo@jobtrack.com / demo1234) is created on first boot.");
        }

        log.info("Production configuration validated. Allowed CORS origins: {}", origins);
    }

    private List<String> allowedOrigins() {
        return Arrays.stream(env.getProperty("app.cors.allowed-origins", "").split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(Collectors.toList());
    }
}
