# Testing Plan - Job Application Backend System

## Overview

This document outlines a comprehensive testing plan for the Job Application Backend API system. The testing plan covers 10 key test cases that validate the core functionality of the application including authentication, job management, application processing, and file handling.

**System Under Test**: Job Application Backend API v1.0.0  
**Test Framework**: Vitest  
**Base URL**: `http://localhost:3000`  
**Database**: SQLite with Drizzle ORM  

---

## Test Case 1: User Registration and Authentication

**Objective**: Verify that users can successfully register, login, and access protected endpoints.

**Priority**: High  
**Category**: Authentication  

### Test Steps:
1. **Setup**: Ensure database is clean and test environment is running
2. **Register New User**:
   - Send POST request to `/api/auth/sign-up/email`
   - Payload: `{ "email": "testuser@example.com", "password": "SecurePass123!", "name": "Test User" }`
   - Verify response status is 201
   - Verify response contains user data without password
3. **Login with Valid Credentials**:
   - Send POST request to `/api/auth/sign-in/email`
   - Payload: `{ "email": "testuser@example.com", "password": "SecurePass123!" }`
   - Verify response status is 200
   - Verify session cookie is set
4. **Access Protected Endpoint**:
   - Send GET request to `/api/profile` with session cookie
   - Verify response status is 200
   - Verify user profile data is returned
5. **Logout**:
   - Send POST request to `/api/auth/sign-out`
   - Verify response status is 200
   - Verify session is invalidated

**Expected Results**:
- User registration succeeds with proper validation
- Login returns valid session
- Protected endpoints are accessible with valid session
- Logout properly invalidates session

---

## Test Case 2: Job Role CRUD Operations

**Objective**: Verify that authenticated admin users can create, read, update, and delete job roles.

**Priority**: High  
**Category**: Job Management  

### Test Steps:
1. **Setup**: Login as admin user
2. **Create New Job Role**:
   - Send POST request to `/api/jobs`
   - Payload:
     ```json
     {
       "jobRoleName": "Senior Frontend Developer",
       "description": "Lead frontend development using React and TypeScript",
       "responsibilities": "Develop UI components, optimize performance, mentor team",
       "jobSpecLink": "https://sharepoint.example.com/job-spec-123",
       "location": "London",
       "capability": "Engineering",
       "band": "Senior",
       "closingDate": "2025-12-31",
       "numberOfOpenPositions": 2
     }
     ```
   - Verify response status is 201
   - Verify job is created with auto-generated ID
3. **Read Job Role**:
   - Send GET request to `/api/jobs/{id}`
   - Verify response status is 200
   - Verify all job details match created data
4. **Update Job Role**:
   - Send PUT request to `/api/jobs/{id}`
   - Update payload: `{ "numberOfOpenPositions": 3 }`
   - Verify response status is 200
   - Verify job is updated correctly
5. **Delete Job Role**:
   - Send DELETE request to `/api/jobs/{id}`
   - Verify response status is 200
   - Send GET request to verify job no longer exists (404)

**Expected Results**:
- Admin can successfully perform all CRUD operations
- Data validation works correctly
- Non-admin users cannot access admin endpoints (403)

---

## Test Case 3: Job Application Submission with CV Upload

**Objective**: Verify that authenticated users can apply to jobs with CV file upload.

**Priority**: High  
**Category**: Application Management  

### Test Steps:
1. **Setup**: 
   - Create a test job role
   - Login as regular user (non-admin)
   - Prepare a test PDF file for CV upload
2. **Submit Job Application**:
   - Send POST request to `/api/applications` with multipart/form-data
   - Form data:
     - `jobId`: (valid job ID)
     - `cv`: (PDF file, < 5MB)
   - Verify response status is 201
   - Verify application is created with status "pending"
3. **Verify CV File Storage**:
   - Check that CV file is stored in `/uploads/cvs/` directory
   - Verify file has unique name to prevent conflicts
   - Verify file permissions are correct
4. **Get User's Applications**:
   - Send GET request to `/api/applications/me`
   - Verify response status is 200
   - Verify submitted application appears in list
5. **Prevent Duplicate Applications**:
   - Attempt to apply to same job again
   - Verify response status is 400 (Business Error)
   - Verify appropriate error message

**Expected Results**:
- File upload works correctly with validation
- Application is created and stored properly
- User cannot apply to same job twice
- CV files are securely stored

---

## Test Case 4: Job Search and Filtering

**Objective**: Verify that users can search and filter jobs by various criteria.

**Priority**: Medium  
**Category**: Job Discovery  

### Test Steps:
1. **Setup**: Create multiple test jobs with different attributes:
   - Job 1: Engineering, Senior, London, Open
   - Job 2: Data, Junior, Manchester, Open  
   - Job 3: Engineering, Principal, London, Closed
2. **Get All Jobs**:
   - Send GET request to `/api/jobs`
   - Verify response status is 200
   - Verify all open jobs are returned
3. **Filter by Capability**:
   - Send GET request to `/api/jobs/search?capability=Engineering`
   - Verify only Engineering jobs are returned
4. **Filter by Band**:
   - Send GET request to `/api/jobs/search?band=Senior`
   - Verify only Senior level jobs are returned
5. **Filter by Location**:
   - Send GET request to `/api/jobs/search?location=London`
   - Verify only London jobs are returned
6. **Multiple Filters**:
   - Send GET request to `/api/jobs/search?capability=Engineering&location=London&status=Open`
   - Verify results match all criteria
7. **No Results Case**:
   - Send GET request with criteria that match no jobs
   - Verify response status is 200 with empty array

**Expected Results**:
- Search functionality works with individual filters
- Multiple filters can be combined effectively
- No results scenario handled gracefully
- Invalid filter values return appropriate errors

---

## Test Case 5: Admin Application Management

**Objective**: Verify that admin users can view and manage all job applications.

**Priority**: High  
**Category**: Application Management  

### Test Steps:
1. **Setup**: 
   - Create test job and applications from different users
   - Login as admin user
2. **View All Applications**:
   - Send GET request to `/api/applications`
   - Verify response status is 200
   - Verify all applications across all jobs are returned
3. **View Applications for Specific Job**:
   - Send GET request to `/api/applications/job/{jobId}`
   - Verify response status is 200
   - Verify only applications for specified job are returned
4. **View Application Details**:
   - Send GET request to `/api/applications/{id}/details`
   - Verify response status is 200
   - Verify detailed application info including user and job data
5. **Access Control Check**:
   - Logout admin and login as regular user
   - Attempt to access `/api/applications` (should return 403)
   - Attempt to access applications for jobs user didn't apply to (should return 403)

**Expected Results**:
- Admin can view all applications and details
- Regular users can only see their own applications
- Proper authorization controls are enforced

---

## Test Case 6: File Download and CV Management

**Objective**: Verify that authorized users can download CV files securely.

**Priority**: Medium  
**Category**: File Management  

### Test Steps:
1. **Setup**: 
   - Create application with CV upload
   - Note the CV filename from application
2. **Download CV as Admin**:
   - Login as admin user
   - Send GET request to `/api/files/cv/{filename}`
   - Verify response status is 200
   - Verify correct Content-Type header (application/pdf)
   - Verify file content is returned
3. **Get CV Info**:
   - Send GET request to `/api/files/cv/{filename}/info`
   - Verify response status is 200
   - Verify file metadata is returned (size, type, etc.)
4. **Unauthorized Access**:
   - Login as different user (not admin, not application owner)
   - Attempt to download CV
   - Verify response status is 403
5. **Non-existent File**:
   - Request CV with invalid filename
   - Verify response status is 404
   - Verify appropriate error message

**Expected Results**:
- Authorized users can download CV files
- File metadata is accessible
- Unauthorized users cannot access files
- Proper error handling for missing files

---

## Test Case 7: User Profile Management

**Objective**: Verify that users can view and update their profile information.

**Priority**: Medium  
**Category**: User Management  

### Test Steps:
1. **Setup**: Register and login as test user
2. **Get Current Profile**:
   - Send GET request to `/api/profile`
   - Verify response status is 200
   - Verify user profile data is returned
3. **Update Profile**:
   - Send PUT request to `/api/profile`
   - Payload:
     ```json
     {
       "name": "Updated Name",
       "phoneNumber": "+44123456789",
       "address": "123 Test Street, London, UK"
     }
     ```
   - Verify response status is 200
   - Verify profile is updated
4. **Validate Profile Data**:
   - Send GET request to `/api/profile` again
   - Verify updated information is persisted
5. **Invalid Profile Update**:
   - Send PUT request with invalid data (e.g., invalid email format)
   - Verify response status is 400
   - Verify validation error messages

**Expected Results**:
- Users can view their profile information
- Profile updates work correctly with validation
- Invalid data is rejected with proper error messages

---

## Test Case 8: API Health and Status Endpoints

**Objective**: Verify that system health and status endpoints work correctly.

**Priority**: Low  
**Category**: System Health  

### Test Steps:
1. **Check API Health**:
   - Send GET request to `/health`
   - Verify response status is 200
   - Verify response contains:
     - Status: "healthy"
     - Timestamp
     - Uptime information
2. **Check Root Endpoint**:
   - Send GET request to `/`
   - Verify response status is 200
   - Verify response contains:
     - API title and version
     - Available endpoints documentation
     - Usage examples
3. **Performance Check**:
   - Measure response time for health endpoint
   - Verify response time is under 100ms

**Expected Results**:
- Health endpoint responds quickly with system status
- Root endpoint provides API documentation
- Response times are acceptable

---

## Test Case 9: Error Handling and Validation

**Objective**: Verify that the API handles errors gracefully and provides meaningful error messages.

**Priority**: Medium  
**Category**: Error Handling  

### Test Steps:
1. **Invalid JSON Payload**:
   - Send POST request with malformed JSON
   - Verify response status is 400
   - Verify error message indicates JSON parsing issue
2. **Missing Required Fields**:
   - Send POST request to `/api/jobs` without required fields
   - Verify response status is 400
   - Verify error specifies missing fields
3. **Invalid Data Types**:
   - Send POST request with wrong data types (string for number field)
   - Verify response status is 400
   - Verify validation error message
4. **Unauthorized Access**:
   - Send request to protected endpoint without authentication
   - Verify response status is 401
   - Verify authentication error message
5. **Not Found Resources**:
   - Send GET request for non-existent job ID
   - Verify response status is 404
   - Verify "not found" error message
6. **Rate Limiting** (if implemented):
   - Send multiple rapid requests
   - Verify rate limiting kicks in with 429 status

**Expected Results**:
- All error scenarios return appropriate HTTP status codes
- Error messages are clear and helpful
- No sensitive information leaked in error responses

---

## Test Case 10: Job Status Scheduler Integration

**Objective**: Verify that the job status scheduler correctly updates job statuses based on closing dates.

**Priority**: Medium  
**Category**: Background Processing  

### Test Steps:
1. **Setup**: 
   - Create jobs with different closing dates:
     - Job A: Closing date in the future (should remain OPEN)
     - Job B: Closing date in the past (should become CLOSED)
     - Job C: Closing date today (should become CLOSED)
2. **Trigger Scheduler**:
   - Access scheduler endpoint `/api/scheduler/jobs/status` (admin required)
   - Verify response status is 200
   - Verify scheduler execution message
3. **Verify Job Status Updates**:
   - Send GET request to `/api/jobs`
   - Verify Job A status is still "OPEN"
   - Verify Job B status is updated to "CLOSED"
   - Verify Job C status is updated to "CLOSED"
4. **Test Application Restrictions**:
   - Attempt to apply to closed job
   - Verify response status is 400
   - Verify error message indicates job is closed
5. **Manual Status Check**:
   - Send GET request to `/api/scheduler/jobs/check-status`
   - Verify response contains status update summary

**Expected Results**:
- Scheduler correctly identifies jobs past closing date
- Job statuses are updated appropriately
- Applications to closed jobs are prevented
- Scheduler provides feedback on actions taken

---

## Test Environment Setup

### Prerequisites:
- Node.js 18+ installed
- SQLite database configured
- Test uploads directory with proper permissions
- Environment variables configured for testing

### Setup Commands:
```bash
# Install dependencies
npm install

# Setup test database
npm run db:setup

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test JobController.test.ts
```

### Test Data Cleanup:
- Reset database between test suites
- Clear uploaded files in test directory
- Reset any cached data or sessions

---

## Success Criteria

Each test case should:
1. **Pass Consistently**: Tests should pass on multiple runs
2. **Proper Assertions**: Verify both positive and negative scenarios
3. **Error Handling**: Test edge cases and error conditions
4. **Performance**: Response times within acceptable limits
5. **Security**: Verify authorization and authentication controls
6. **Data Integrity**: Ensure database consistency after operations

## Test Execution Strategy

1. **Unit Tests**: Run individual component tests first
2. **Integration Tests**: Test API endpoints with real database
3. **End-to-End Tests**: Full user workflow scenarios
4. **Performance Tests**: Load testing for critical endpoints
5. **Security Tests**: Authentication and authorization validation

---

*This testing plan covers the core functionality of the Job Application Backend system. Additional tests may be added as new features are developed.*