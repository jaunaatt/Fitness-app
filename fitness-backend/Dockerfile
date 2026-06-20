# ── Stage 1: Build ─────────────────────────────────────────────────────────────
# Uses the official Maven image with Java 21 to compile and package the app.
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Download dependencies first (separate layer for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
# Uses a minimal JRE image. The multi-stage build means the final image does
# NOT include Maven, source code, or build artifacts other than the jar.
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S forgefit && adduser -S forgefit -G forgefit
USER forgefit

COPY --from=build /app/target/fitness-backend-0.0.1-SNAPSHOT.jar app.jar

# JVM memory flags tuned for Render's free tier (512 MB RAM limit).
# -Xmx400m: max heap 400 MB, leaving ~100 MB for OS + non-heap.
# -Xms200m: initial heap to avoid slow startup from excessive GC at boot.
# -XX:+UseSerialGC: serial GC uses less memory overhead than G1 on small heaps.
ENV JAVA_OPTS="-Xmx400m -Xms200m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"

# Render injects PORT; the app reads it via server.port=${PORT:8080}
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE:-prod} -jar app.jar"]
