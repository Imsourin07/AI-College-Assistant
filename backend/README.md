# AI College Assistant — Production Spring Boot 3 Backend

This directory contains the production-grade **Java 17 + Spring Boot 3** backend for the AI College Assistant.

---

## 🛠️ Technology Stack
- **Language**: Java 17 (OpenJDK 17 LTS)
- **Framework**: Spring Boot 3.2.5
- **Security**: Spring Security 6 + JJWT 0.12.5 + BCrypt Password Encoder
- **Persistence**: Spring Data JPA + Hibernate
- **Database**: PostgreSQL 15+ (Production) / H2 in-memory (Local dev/test)
- **Database Migrations**: Flyway Core & Flyway PostgreSQL
- **PDF Processing**: Apache PDFBox 3.0.2
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`)
- **Build Tool**: Apache Maven 3.9+

---

## 🔒 Security Architecture
- **Stateless JWT Authentication**: Tokens are signed using HMAC-SHA256 (`HS256`) and verified via `JwtAuthFilter`.
- **Dynamic SecurityContext Resolution**: No hardcoded user IDs. Every chat session and message is tied dynamically to the authenticated `User` entity.
- **Document Ownership & Isolation**: Documents retain `user_id` ownership. Only the uploader or users with role `ADMIN` can delete documents.
- **BCrypt Encryption**: Passwords are never stored in plain text and are salted with BCrypt.

---

## 🚀 How to Run Locally

### Prerequisites
- **Java 17** (`java -version`)
- **Maven 3.8+** (`mvn -v`)
- *(Optional)* **PostgreSQL** running locally on port 5432

### 1. Run in Development Mode (with Embedded H2 Database)
No external database installation needed:
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
- Server starts on `http://localhost:8080`.
- H2 Web Console accessible at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:college_assistant_db`, User: `sa`, Password: blank).

### 2. Run in Production Mode (with PostgreSQL)
Start PostgreSQL using Docker:
```bash
docker run -d --name college-postgres -p 5432:5432 \
  -e POSTGRES_DB=college_assistant_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

Execute Spring Boot with production profile and environment variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/college_assistant_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=postgres
export JWT_SECRET=your_super_secure_256_bit_jwt_secret_key_here
export GEMINI_API_KEY=your_gemini_api_key

mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

### 3. Build Production Executable JAR & Run Unit Tests
```bash
mvn clean package
java -jar target/assistant-1.0.0.jar --spring.profiles.active=prod
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student profile (`name`, `email`, `password`, `semester`). |
| `POST` | `/api/auth/login` | Public | Sign in student and receive JWT token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile for logged-in user. |
| `POST` | `/api/documents/upload` | Authenticated / Public | Upload PDF notes with semester and subject tagging; indexes into RAG engine. |
| `GET` | `/api/documents/list` | Public | List indexed documents filtered by semester & subject. |
| `DELETE` | `/api/documents/{id}` | Authenticated (Owner) | Delete document and corresponding RAG text chunks. |
| `POST` | `/api/chat/send` | Authenticated | Query RAG engine + Gemini AI with multi-language (English/Bengali) support. |
| `GET` | `/api/chat/sessions` | Authenticated | List previous chat sessions for current user. |
| `GET` | `/api/chat/session/{id}`| Authenticated (Owner) | Load all messages and source citations for a session. |
| `DELETE` | `/api/chat/session/{id}`| Authenticated (Owner) | Delete user chat session. |
