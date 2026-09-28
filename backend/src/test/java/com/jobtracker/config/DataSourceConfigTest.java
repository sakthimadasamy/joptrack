package com.jobtracker.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DataSourceConfigTest {

    private final DataSourceConfig.Credentials credentials = new DataSourceConfig.Credentials(null, null);

    @Test
    void convertsSupabaseConnectionStringAndExtractsCredentials() {
        String url = "postgresql://postgres:hunter2@db.abcdefgh.supabase.co:5432/postgres";

        String jdbcUrl = DataSourceConfig.normalise(url, credentials);

        assertEquals("jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres?sslmode=require", jdbcUrl);
        assertEquals("postgres", credentials.username);
        assertEquals("hunter2", credentials.password);
    }

    @Test
    void supportsPoolerUsernameContainingADot() {
        String url = "postgresql://postgres.projectref:secret@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

        String jdbcUrl = DataSourceConfig.normalise(url, credentials);

        assertTrue(jdbcUrl.startsWith("jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres"));
        assertEquals("postgres.projectref", credentials.username);
        assertEquals("secret", credentials.password);
    }

    @Test
    void decodesPercentEncodedPassword() {
        String url = "postgresql://postgres:p%40ssw0rd%21@db.abcdefgh.supabase.co:5432/postgres";

        DataSourceConfig.normalise(url, credentials);

        assertEquals("p@ssw0rd!", credentials.password);
    }

    @Test
    void leavesJdbcUrlsUntouchedSoLocalMySqlStillWorks() {
        String url = "jdbc:mysql://localhost:3306/job_tracker?createDatabaseIfNotExist=true&useSSL=false";

        assertEquals(url, DataSourceConfig.normalise(url, credentials));
    }

    @Test
    void doesNotForceSslOnLoopback() {
        String url = "postgresql://postgres:secret@localhost:5432/job_tracker";

        assertEquals("jdbc:postgresql://localhost:5432/job_tracker", DataSourceConfig.normalise(url, credentials));
    }

    @Test
    void keepsAnExplicitSslMode() {
        String url = "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres?sslmode=verify-full";

        String jdbcUrl = DataSourceConfig.normalise(url, credentials);

        assertEquals("jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres?sslmode=verify-full", jdbcUrl);
        assertFalse(jdbcUrl.contains("require"));
    }

    @Test
    void mergesSslModeIntoAnExistingQueryString() {
        String url = "postgresql://postgres:secret@db.abcdefgh.supabase.co:5432/postgres?Application_Name=jobtrack";

        assertEquals("jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres"
                + "?Application_Name=jobtrack&sslmode=require",
                DataSourceConfig.normalise(url, credentials));
    }

    @Test
    void rejectsAnUnsupportedScheme() {
        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> DataSourceConfig.normalise("mysql://root:pw@localhost:3306/db", credentials));

        assertTrue(error.getMessage().contains("Unsupported DATABASE_URL scheme"));
    }

    @Test
    void neverLogsCredentials() {
        String redacted = DataSourceConfig.redact(
                "jdbc:postgresql://db.abcdefgh.supabase.co:5432/postgres?sslmode=require&password=hunter2");

        assertFalse(redacted.contains("hunter2"));
    }

    @Test
    void treatsIPv6LoopbackAsLocal() {
        assertFalse(DataSourceConfig.isRemoteHost("[::1]:5432/postgres"));
        assertTrue(DataSourceConfig.isRemoteHost("db.abcdefgh.supabase.co:5432/postgres"));
    }
}
