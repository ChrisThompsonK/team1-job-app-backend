# Job Application Backend API Documentation

## Overview

Welcome to the Job Application System Backend API. This API provides comprehensive functionality for job management, user authentication, and application processing.

**Base URL**: `http://localhost:3000`
**Version**: 1.0.0

## Authentication

This API uses Better Auth for session-based authentication with email/password credentials.

### Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/sign-in/email` | POST | User login | No |
| `/api/auth/sign-up/email` | POST | User registration | No |
| `/api/auth/sign-out` | POST | User logout | No |
| `/api/auth/get-session` | GET | Get current session | No |
| `/api/profile` | GET | Get user profile | Yes |
| `/api/profile` | PUT | Update user profile | Yes |

## User Profile Management

### Profile Fields

| Field | Type | Description | Editable |
|-------|------|-------------|----------|
| `id` | string | Unique user identifier | No |
| `name` | string \| null | User's full name | Yes |
| `email` | string | User's email address | Yes* |
| `emailVerified` | boolean | Email verification status | No |
| `isAdmin` | boolean | Admin privileges | No |
| `phoneNumber` | string \| null | User's phone number | Yes |
| `address` | string \| null | User's address | Yes |

*Email updates require special handling through Better Auth

### GET /api/profile

Returns the current user's profile information.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "isAdmin": false,
      "phoneNumber": "+44 7123 456789",
      "address": "123 Main St, London, UK"
    }
  }
}
```

### PUT /api/profile

Update user profile information. Supports partial updates.

**Request Body Examples:**

#### Basic Information Update
```json
{
  "name": "John Doe",
  "phoneNumber": "+44 7123 456789",
  "address": "123 Main St, London, UK"
}
```

#### Email Update
```json
{
  "newEmail": "newemail@example.com"
}
```

#### Password Update
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

#### Clear Optional Fields
```json
{
  "phoneNumber": "",
  "address": null
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Profile information updated successfully",
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "isAdmin": false,
      "phoneNumber": "+44 7123 456789",
      "address": "123 Main St, London, UK"
    }
  }
}
```

### Validation Rules

#### Name
- **Max Length**: 100 characters
- **Cannot be empty**: Must contain at least one non-whitespace character
- **Type**: String

#### Phone Number
- **Format**: Digits, spaces, dashes, parentheses, and plus sign allowed
- **Length**: 7-15 digits after removing formatting characters
- **Can be cleared**: Send empty string or null to remove
- **Examples**: 
  - `"+44 7123 456789"`
  - `"(555) 123-4567"`
  - `"01234567890"`

#### Address
- **Max Length**: 500 characters
- **Can be cleared**: Send empty string or null to remove
- **Type**: String

#### Email
- **Must be unique**: Cannot use an email already registered to another user
- **Validation**: Uses Better Auth validation
- **Special handling**: Requires Better Auth API call

#### Password
- **Requires current password**: Must provide current password to change
- **Strength requirements**: Defined by Better Auth configuration

### Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Validation error or bad request |
| 401 | Not authenticated |
| 409 | Email already in use |
| 500 | Internal server error |

## Job Management

### Job Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/jobs` | GET | Get all jobs | No |
| `/api/jobs/:id` | GET | Get job by ID | No |
| `/api/jobs/search` | GET | Search jobs with filters | No |
| `/api/jobs` | POST | Create new job | Yes (Admin) |
| `/api/jobs/:id` | PUT | Update job | Yes (Admin) |
| `/api/jobs/:id` | DELETE | Delete job | Yes (Admin) |

### Job Search & Filtering

**Endpoint**: `/api/jobs/search`

Server-side filtering with comprehensive query parameters for efficient job discovery.

#### Query Parameters

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| `capability` | Filter by job capability | `DATA`, `ENGINEERING`, `DESIGN`, `PRODUCT` |
| `band` | Filter by seniority level | `Junior`, `Mid`, `Senior`, `Principal` |
| `location` | Filter by location (partial match) | `London`, `Remote`, `Manchester` |
| `status` | Filter by job status | `open`, `closed` |
| `search` | Text search across title, description, responsibilities | `engineer`, `python` |
| `page` | Page number for pagination | `1`, `2`, `3` (default: 1) |
| `limit` | Items per page | `5`, `10`, `20` (1-100, default: 10) |
| `sortBy` | Sort field | `jobRoleName`, `closingDate`, `band`, `capability` |
| `sortOrder` | Sort direction | `asc`, `desc` (default: asc) |

#### Example Requests

```
GET /api/jobs/search?capability=DATA&band=Senior
GET /api/jobs/search?search=engineer&sortBy=closingDate&sortOrder=desc
GET /api/jobs/search?location=London&page=1&limit=5
GET /api/jobs/search?status=open&capability=ENGINEERING&sortBy=band
```

#### Capability Values

- `DATA` - Data engineering, analytics, science roles
- `WORKDAY` - Workday system administration and development
- `ENGINEERING` - Software engineering and development
- `PRODUCT` - Product management and strategy
- `DESIGN` - UX/UI design and user research
- `PLATFORM` - Platform engineering and infrastructure
- `QUALITY` - Quality assurance and testing
- `ARCHITECTURE` - Solution and technical architecture
- `BUSINESS_ANALYSIS` - Business analysis and requirements
- `SECURITY` - Security engineering and compliance

## Application Management

### Application Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/applications` | POST | Apply to a job | Yes |
| `/api/applications/me` | GET | Get my applications | Yes |
| `/api/applications` | GET | Get all applications | Yes (Admin) |
| `/api/applications/:id` | GET | Get application by ID | Yes |
| `/api/applications/job/:jobId` | GET | Get applications for a job | Yes (Admin) |

## Scheduler Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/scheduler/*` | Various | Job scheduling and automation | Yes (Admin) |

## Health Check

### GET /health

Returns API health status and basic system information.

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-19T10:30:00.000Z",
  "uptime": 3600.5
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented, but it may be added in future versions.

## CORS

The API supports CORS for cross-origin requests from approved domains.

## Getting Started

1. Start the server: `npm start`
2. API will be available at `http://localhost:3000`
3. Visit `http://localhost:3000` for a quick API overview
4. Use `/health` endpoint to verify the API is running

## Support

For technical support or questions about this API, please refer to the project repository or contact the development team.