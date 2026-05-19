# syntax=docker/dockerfile:1.7

# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Cache dependencies first
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Build the app
COPY src ./src
RUN mvn -q -B -DskipTests clean package \
 && mv target/*.jar /workspace/app.jar

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Render injects PORT at runtime; default to 8080 locally
ENV PORT=8080
EXPOSE 8080

COPY --from=build /workspace/app.jar /app/app.jar

# Honour Render's PORT and allow JVM tuning via JAVA_OPTS
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/app.jar"]
