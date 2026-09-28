# ---------- build ----------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# Dependencies resolve in their own layer, so source-only changes skip the
# dependency download instead of re-resolving the whole tree every build.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run unprivileged. Nothing in the app needs write access or a shell.
RUN useradd --system --create-home --uid 10001 spring
USER spring

COPY --from=build /app/target/job-tracker-backend-1.0.0.jar app.jar

EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"

# exec form so the JVM is PID 1 and receives SIGTERM for a graceful shutdown.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
