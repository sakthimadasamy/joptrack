package com.jobtracker.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Boots the whole application against an in-memory database. This is the only
 * test that catches wiring mistakes - a missing actuator dependency, a DataSource
 * bean clashing with Spring Boot's auto-configuration, a broken profile split -
 * none of which show up in the unit tests.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:contextload;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "app.seed.enabled=false"
})
class ApplicationContextTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void contextLoadsAndSchemaIsCreated() throws Exception {
        assertNotNull(dataSource);

        try (Connection connection = dataSource.getConnection()) {
            assertTrue(connection.isValid(2));
        }
    }
}
