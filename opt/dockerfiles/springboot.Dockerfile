# /opt/dockerfiles/springboot.Dockerfile
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy jar built by Maven/Gradle
COPY target/*.jar app.jar

# Expose port (Jenkins sets 8080)
EXPOSE 8080

# Run Spring Boot jar
ENTRYPOINT ["java", "-jar", "app.jar"]