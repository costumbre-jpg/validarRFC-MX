FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-slim
WORKDIR /app
COPY --from=builder /app/target/validarfc-java-1.0.0.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar", "--server.port=8000"]
