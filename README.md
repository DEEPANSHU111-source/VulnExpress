# VulnExpress

VulnExpress is an intentionally vulnerable Express.js REST API created for learning and practicing Application Security, API Security, Web Penetration Testing, and secure coding.

The project follows a practical security methodology:

> **Build → Test → Exploit → Understand → Fix → Retest**

The objective is not simply to learn Express.js syntax. The objective is to understand how vulnerabilities appear in real-world APIs, how attackers identify them, and how developers can properly fix them.

---

## ⚠️ Disclaimer

**VulnExpress is intentionally vulnerable.**

This project is created strictly for educational and authorized security testing purposes.

It is suitable for:

- Local security labs
- Application Security learning
- API security practice
- Web penetration testing practice
- Burp Suite practice
- Express.js source-code review
- Secure coding education
- Vulnerability research in a controlled environment

Run this project only on a system that you own or have explicit permission to test.

**Do not deploy the intentionally vulnerable version to a public server or production environment.**

---

# Features

## Express.js

- Express.js application
- REST API
- Routing
- Request and response handling
- Middleware
- JSON request parsing
- URL-encoded request parsing
- Error handling
- 404 handling

## Authentication

- User registration
- Login
- Password hashing using bcrypt
- JWT authentication
- Protected endpoints

## Authorization

- User roles
- Admin role
- Admin-only endpoint
- Authorization middleware
- Ownership testing

## API Security

The project intentionally contains weak implementations for practicing:

- IDOR
- BOLA
- Broken access control
- Weak authorization
- Mass assignment
- Missing ownership checks
- File upload security
- Input validation
- API request manipulation

## Security Middleware

The project demonstrates:

- Helmet
- CORS
- Rate limiting

---

# Technology Stack

- Node.js
- Express.js
- JSON Web Tokens
- bcryptjs
- Multer
- Helmet
- CORS
- Express Rate Limit
- Burp Suite

---

# Project Structure

```text
VulnExpress/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

The following are intentionally excluded from Git:

```text
node_modules/
.env
uploads/
*.log
```

---

# Installation

## 1. Clone the repository

```bash
git clone https://github.com/DEEPANSHU111-source/VulnExpress.git
```


## 2. Enter the project

```bash
cd VulnExpress
```

---

## 3. Install dependencies

```bash
npm install
```

---

# Running the Application

Start the server:

```bash
npm start
```

The API will run at:

```text
http://localhost:3000
```

You can also start it directly:

```bash
node server.js
```

Expected output:

```text
VulnExpress running at http://localhost:3000
```

---

# Basic API Endpoints

## Home

```http
GET /
```

Test:

```bash
curl http://localhost:3000/
```

Expected response:

```json
{
  "message": "VulnExpress API is running",
  "version": "1.0"
}
```

---

# Users

## Get All Users

```http
GET /users
```

Test:

```bash
curl http://localhost:3000/users
```

---

# Products

## Get All Products

```http
GET /products
```

Test:

```bash
curl http://localhost:3000/products
```

---

## Get Product by ID

```http
GET /products/:id
```

Example:

```bash
curl http://localhost:3000/products/1
```

---

# Authentication

## Register

```http
POST /register
```

Example:

```bash
curl -X POST http://localhost:3000/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"test123"}'
```

Expected response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 3,
    "username": "testuser",
    "role": "user"
  }
}
```

---

# Login

```http
POST /login
```

Example:

```bash
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"test123"}'
```

The server returns a JWT:

```json
{
  "message": "Login successful",
  "token": "eyJ..."
}
```

Save the token for testing protected endpoints.

---

# Using the JWT

Protected endpoints expect:

```http
Authorization: Bearer YOUR_TOKEN
```

Example:

```bash
curl http://localhost:3000/profile \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# Profile

## Get Current User Profile

```http
GET /profile
```

This endpoint requires authentication.

Example:

```bash
curl http://localhost:3000/profile \
-H "Authorization: Bearer YOUR_TOKEN"
```

---

# Admin

## Admin Endpoint

```http
GET /admin
```

This endpoint requires:

1. A valid JWT
2. An authenticated user
3. The `admin` role

Example:

```bash
curl http://localhost:3000/admin \
-H "Authorization: Bearer ADMIN_TOKEN"
```

A normal user should receive:

```json
{
  "error": "Admin access required"
}
```

---

# Orders

## Get Current User's Orders

```http
GET /orders
```

Example:

```bash
curl http://localhost:3000/orders \
-H "Authorization: Bearer YOUR_TOKEN"
```

The application filters orders based on the authenticated user's ID.

---

## Get Order by ID

```http
GET /orders/:id
```

Example:

```bash
curl http://localhost:3000/orders/1 \
-H "Authorization: Bearer YOUR_TOKEN"
```

This endpoint is intentionally vulnerable to demonstrate BOLA/IDOR.

---

# Create Order

```http
POST /orders
```

Example:

```bash
curl -X POST http://localhost:3000/orders \
-H "Authorization: Bearer YOUR_TOKEN" \
-H "Content-Type: application/json" \
-d '{"product":"Laptop"}'
```

---

# Search

```http
GET /search?q=QUERY
```

Example:

```bash
curl "http://localhost:3000/search?q=laptop"
```

The application obtains the search value from:

```javascript
req.query.q
```

This is useful for understanding how attacker-controlled query parameters enter an Express application.

---

# File Upload

```http
POST /upload
```

The endpoint requires authentication.

Example:

```bash
curl -X POST http://localhost:3000/upload \
-H "Authorization: Bearer YOUR_TOKEN" \
-F "file=@test.txt"
```

The initial implementation intentionally performs minimal file validation.

This creates a controlled environment for studying:

- File extension validation
- MIME type validation
- File content validation
- File signature validation
- Dangerous file types
- Filename handling
- Upload storage
- Upload access controls

---

# Intentional Vulnerabilities

The current version intentionally contains vulnerabilities.

These vulnerabilities are included so that they can be discovered, exploited locally, understood, and then fixed.

---

# 1. IDOR / BOLA

The endpoint:

```text
GET /users/:id/profile
```

does not properly verify whether the authenticated user is authorized to access the requested profile.

The application essentially performs:

```text
Authenticated user
        |
        v
Requests /users/2/profile
        |
        v
Does user 2 exist?
        |
        v
Return user 2
```

The missing security check is:

```text
Is the authenticated user allowed to access user 2?
```

This demonstrates a fundamental API security concept:

### Authentication

> Who are you?

### Authorization

> What are you allowed to access?

A user can be successfully authenticated while still being unauthorized to access another user's resources.

---

# 2. Order IDOR / BOLA

The endpoint:

```text
GET /orders/:id
```

does not properly verify whether the authenticated user owns the requested order.

For example:

```text
User 1
  |
  +----> /orders/1
  |
  +----> /orders/2
```

The second request should normally be rejected if order `2` belongs to another user.

This endpoint is intentionally weak so that the authorization flaw can be tested with Burp Suite.

---

# 3. Broken Authorization

The endpoint:

```text
PUT /users/:id
```

does not correctly enforce ownership or role restrictions.

A properly secured application should determine whether the authenticated user has permission to modify the requested account.

The vulnerable implementation does not perform sufficient authorization checks.

---

# 4. Mass Assignment

The update endpoint accepts fields directly from the request body.

For example:

```json
{
  "username": "attacker",
  "role": "admin"
}
```

The application accepts the `role` property.

This demonstrates a mass-assignment / over-posting style security problem.

A secure application should explicitly define which fields a user is allowed to modify.

For example:

```text
Allowed:
    username

Not allowed:
    role
    id
    permissions
```

---

# 5. File Upload Security

The initial file upload implementation uses Multer but does not implement strong validation.

It does not fully validate:

- File extension
- MIME type
- File signature
- File contents
- Dangerous file types
- Filename security
- Storage location
- File access permissions

This is intentional.

The purpose is to later harden the endpoint and compare the vulnerable and secure implementations.

---

# Security Controls Already Demonstrated

Although some endpoints are intentionally vulnerable, the project also demonstrates several defensive controls.

---

## Password Hashing

Passwords are hashed using bcrypt.

The application uses:

```javascript
bcrypt.hash()
```

and:

```javascript
bcrypt.compare()
```

for password verification.

---

## JWT Authentication

The project uses JSON Web Tokens for authentication.

The basic flow is:

```text
Username + Password
        |
        v
   Authentication
        |
        v
       JWT
        |
        v
Authorization Header
        |
        v
JWT Verification
        |
        v
Protected Route
```

---

## Authorization Middleware

The project contains:

```javascript
requireAdmin()
```

This middleware checks whether the authenticated user has the administrator role.

---

## Helmet

Helmet is used to add common HTTP security headers.

---

## CORS

The project demonstrates CORS middleware.

CORS controls which browser origins are permitted to interact with an API.

---

## Rate Limiting

The application uses:

```text
express-rate-limit
```

to restrict excessive requests.

The current configuration allows a limited number of requests within a defined time window.

---

# AppSec Source-Code Review Mindset

When reviewing an Express application, follow attacker-controlled data.

Start with:

```text
HTTP Request
      |
      +-- req.params
      |
      +-- req.query
      |
      +-- req.body
      |
      +-- req.headers
      |
      +-- req.cookies
      |
      +-- uploaded files
```

Then trace where that data goes:

```text
Input
  |
  v
Validation
  |
  v
Authentication
  |
  v
Authorization
  |
  v
Business Logic
  |
  v
Database / File System
  |
  v
Response
```

At every stage ask:

```text
Can the attacker control this?
        |
        v
Is it validated?
        |
        v
Is the user authenticated?
        |
        v
Is the user authorized?
        |
        v
Is ownership verified?
        |
        v
Is dangerous input safely handled?
```

This is one of the most important skills for an AppSec engineer or web pentester.

---

# Burp Suite Testing

VulnExpress can be tested using Burp Suite.

Recommended workflow:

```text
Browser / curl
      |
      v
Burp Proxy
      |
      v
VulnExpress
      |
      v
Capture Request
      |
      v
Send to Repeater
      |
      v
Modify Request
      |
      v
Observe Response
      |
      v
Identify Security Issue
```

Useful Burp tools include:

- Proxy
- Repeater
- Intruder
- Decoder
- Comparer

---

# Example BOLA Test

Assume you authenticate as:

```text
User ID: 1
```

First request:

```http
GET /users/1/profile
Authorization: Bearer YOUR_TOKEN
```

Then change the resource ID:

```http
GET /users/2/profile
Authorization: Bearer YOUR_TOKEN
```

Compare both responses.

If user `1` can access user `2`'s information without authorization, the application has an object-level authorization problem.

This is the type of issue commonly referred to as:

- IDOR
- BOLA
- Broken Object Level Authorization

---

# Example Order Test

Authenticate as user `1`.

Request:

```http
GET /orders/1
Authorization: Bearer YOUR_TOKEN
```

Then change:

```http
GET /orders/2
Authorization: Bearer YOUR_TOKEN
```

Compare the responses.

The application should verify that the requested order belongs to the authenticated user.

---

# Example Mass Assignment Test

Send:

```http
PUT /users/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

with:

```json
{
  "username": "changed",
  "role": "admin"
}
```

Observe whether the `role` property can be modified.

This is a controlled local demonstration of why APIs should not blindly accept arbitrary request-body properties.

---

# Security Testing Methodology

The recommended workflow is:

```text
Start Application
       |
       v
Explore API
       |
       v
Read Source Code
       |
       v
Identify Inputs
       |
       +--------------------+
       |                    |
       v                    v
   req.params           req.query
       |                    |
       +---------+----------+
                 |
                 v
              req.body
                 |
                 v
             req.headers
                 |
                 v
          Authentication
                 |
                 v
           Authorization
                 |
                 v
           Business Logic
                 |
                 v
          Database / Files
                 |
                 v
             Response
```

---

# What to Test

During the security assessment, investigate:

### Authentication

- Missing authentication
- Invalid credentials
- Token handling
- Expired tokens
- Invalid tokens
- JWT manipulation
- Authentication logic

### Authorization

- Horizontal privilege escalation
- Vertical privilege escalation
- IDOR
- BOLA
- Role manipulation
- Ownership checks

### Input Handling

- Parameters
- Query strings
- JSON bodies
- HTTP headers
- User-controlled IDs
- File uploads

### Business Logic

- Unauthorized actions
- Changing object ownership
- Modifying another user's resources
- Manipulating roles
- Accessing another user's orders

### File Upload

- Extension validation
- MIME validation
- Content validation
- File size
- Filename handling
- Storage location
- File access

---

# Secure Development Goal

The goal of this project is not to leave the application vulnerable.

The intended process is:

```text
Vulnerable Code
       |
       v
Understand Code
       |
       v
Find Vulnerability
       |
       v
Test Locally
       |
       v
Understand Root Cause
       |
       v
Implement Fix
       |
       v
Retest
       |
       v
Write Security Test
       |
       v
Secure Code
```

---

# Planned Improvements

Future versions of VulnExpress can include:

- PostgreSQL
- Prisma
- Strong input validation
- Secure authorization
- Proper ownership checks
- Secure file uploads
- JWT security improvements
- Refresh-token handling
- Session authentication
- CSRF protection where applicable
- Security logging
- Automated tests
- Security regression tests
- API documentation
- Secure error handling
- Production configuration

---

# Learning Objectives

After completing the project, the learner should be able to explain:

- How Node.js runs a server
- How Express.js works
- How Express routing works
- How middleware works
- How `req.params` works
- How `req.query` works
- How `req.body` works
- How HTTP headers reach an application
- How authentication works
- How JWT authentication works
- Authentication vs authorization
- RBAC
- IDOR
- BOLA
- Broken access control
- Mass assignment
- File upload vulnerabilities
- CORS
- Security headers
- Rate limiting
- Error handling
- API security testing
- Burp Suite API testing
- Express.js source-code review
- Secure coding practices

---

# Educational Purpose

VulnExpress is part of a practical Application Security and Web Penetration Testing learning project.

The project focuses on both offensive and defensive security.

## Offensive Perspective

```text
Find
  |
  v
Test
  |
  v
Exploit
  |
  v
Prove
```

## Defensive Perspective

```text
Understand
  |
  v
Fix
  |
  v
Test
  |
  v
Prevent
```

The combination of both approaches is important for an Application Security role.

---

# Author

**Deepanshu Deswal**

B.Tech Computer Science Engineering

Focus Areas:

- Application Security
- Web Application Security
- API Security
- Web Penetration Testing
- Security Automation

---

# License

This project is licensed under the MIT License.
