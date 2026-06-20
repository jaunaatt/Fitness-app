# Archived `fitness-db` (Laravel)

This Laravel project was originally used strictly to maintain the database schema via migrations for the Spring Boot backend during earlier development phases. 

As part of the production-readiness transition (Phase 2), the Spring Boot application was configured to own and manage its own PostgreSQL schema (using `spring.jpa.hibernate.ddl-auto=update` and/or future Flyway/Liquibase migrations). 

This Laravel project is no longer required for the application to function and has been archived here for historical reference.
