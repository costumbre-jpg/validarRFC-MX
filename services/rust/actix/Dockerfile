FROM rust:1.73-alpine AS builder
RUN apk add --no-cache musl-dev
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release
COPY src ./src
RUN cargo build --release

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/validarfc .
EXPOSE 8000
CMD ["./validarfc"]
