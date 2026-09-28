package com.jobtracker.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Builds the DataSource from whichever connection string the platform hands us.
 *
 * Resolution order:
 * <ol>
 *   <li>{@code DATABASE_URL} - a URI such as Supabase's
 *       {@code postgresql://user:pw@db.project.supabase.co:5432/postgres}</li>
 *   <li>{@code spring.datasource.url} - an explicit JDBC URL</li>
 * </ol>
 *
 * Supabase, Render, Railway and Heroku all issue URI-style connection strings
 * rather than JDBC URLs, so the URI form is normalised here instead of making
 * every deploy target reformat it. Credentials embedded in the URI are lifted
 * out into the Hikari username/password, which is the only reliable place for
 * them - a JDBC URL carrying a password is also prone to being logged.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    private static final String POSTGRES_SCHEME = "postgresql://";
    private static final String POSTGRES_ALT_SCHEME = "postgres://";

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Value("${spring.datasource.hikari.connection-timeout:20000}")
    private long connectionTimeout;

    @Bean
    public DataSource dataSource() {
        String rawUrl = StringUtils.hasText(System.getenv("DATABASE_URL"))
                ? System.getenv("DATABASE_URL")
                : configuredUrl;

        if (!StringUtils.hasText(rawUrl)) {
            throw new IllegalStateException(
                    "No database configured. Set DATABASE_URL to your platform connection string "
                            + "(Supabase/Render/Railway) or set spring.datasource.url to a JDBC URL.");
        }

        Credentials credentials = new Credentials(configuredUsername, configuredPassword);
        String jdbcUrl = normalise(rawUrl, credentials);

        log.info("DataSource configured for {} as user '{}' (pool {}/{})",
                redact(jdbcUrl),
                credentials.username == null ? "<none>" : credentials.username,
                minIdle, maxPoolSize);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        dataSource.setUsername(credentials.username);
        dataSource.setPassword(credentials.password);
        dataSource.setMaximumPoolSize(maxPoolSize);
        dataSource.setMinimumIdle(minIdle);
        dataSource.setConnectionTimeout(connectionTimeout);
        dataSource.setPoolName("jobtracker-pool");
        return dataSource;
    }

    /**
     * Converts a platform connection string into a JDBC URL, extracting any
     * embedded credentials into {@code credentials}.
     */
    static String normalise(String rawUrl, Credentials credentials) {
        String value = rawUrl.trim();

        if (value.startsWith("jdbc:")) {
            return value;
        }

        String lower = value.toLowerCase();
        if (lower.startsWith(POSTGRES_SCHEME)) {
            value = value.substring(POSTGRES_SCHEME.length());
        } else if (lower.startsWith(POSTGRES_ALT_SCHEME)) {
            value = value.substring(POSTGRES_ALT_SCHEME.length());
        } else {
            throw new IllegalStateException("Unsupported DATABASE_URL scheme in '" + redact(value)
                    + "'. Expected a jdbc:, postgresql:// or postgres:// URL.");
        }

        int at = value.lastIndexOf('@');
        if (at >= 0) {
            String userInfo = value.substring(0, at);
            value = value.substring(at + 1);

            int colon = userInfo.indexOf(':');
            if (colon >= 0) {
                credentials.username = decode(userInfo.substring(0, colon));
                credentials.password = decode(userInfo.substring(colon + 1));
            } else {
                credentials.username = decode(userInfo);
            }
        }

        String[] hostAndQuery = value.split("\\?", 2);
        String hostPortAndDatabase = hostAndQuery[0];
        String query = hostAndQuery.length > 1 ? hostAndQuery[1] : "";

        StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://").append(hostPortAndDatabase);

        String mergedQuery = withSslMode(query, hostPortAndDatabase);
        if (!mergedQuery.isEmpty()) {
            jdbcUrl.append('?').append(mergedQuery);
        }

        return jdbcUrl.toString();
    }

    /**
     * Managed Postgres (Supabase in particular) refuses plaintext connections, so
     * default to requiring SSL for anything that is not a loopback address. An
     * explicit {@code sslmode}/{@code ssl} in the connection string always wins.
     */
    private static String withSslMode(String query, String hostPortAndDatabase) {
        if (query.contains("sslmode=") || query.contains("ssl=")) {
            return query;
        }
        if (!isRemoteHost(hostPortAndDatabase)) {
            return query;
        }
        return query.isEmpty() ? "sslmode=require" : query + "&sslmode=require";
    }

    static boolean isRemoteHost(String hostPortAndDatabase) {
        String host = hostPortAndDatabase;

        int slash = host.indexOf('/');
        if (slash >= 0) {
            host = host.substring(0, slash);
        }

        // Strip the port. A bracketed IPv6 literal is left alone, otherwise its
        // own colons would be mistaken for the port separator.
        if (host.startsWith("[")) {
            int close = host.indexOf(']');
            if (close >= 0) {
                host = host.substring(0, close + 1);
            }
        } else {
            int colon = host.lastIndexOf(':');
            if (colon >= 0) {
                host = host.substring(0, colon);
            }
        }

        host = host.trim().toLowerCase();
        if (host.startsWith("[") && host.endsWith("]")) {
            host = host.substring(1, host.length() - 1);
        }

        return !host.equals("localhost")
                && !host.equals("127.0.0.1")
                && !host.equals("::1");
    }

    static String redact(String url) {
        return url.replaceFirst("//[^@/]*@", "//***@").replaceAll("\\?.*$", "?***");
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    /** Mutable holder so {@link #normalise} can return credentials alongside the URL. */
    static final class Credentials {
        String username;
        String password;

        Credentials(String username, String password) {
            this.username = username;
            this.password = password;
        }
    }
}
