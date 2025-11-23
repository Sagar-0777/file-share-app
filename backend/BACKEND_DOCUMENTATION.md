# Backend Documentation - File Share App

## Overview

This is a secure file-sharing backend built with Node.js, Express, MongoDB, Firebase Authentication, and AWS S3. It supports OTP-based authentication, file uploads with cloud storage, and secure download link generation.

## Architecture

```
Backend Stack:
├── Node.js + Express - Server framework
├── MongoDB - Database for users, files, OTPs
├── Firebase Admin SDK - OTP authentication
├── AWS S3 - Cloud file storage
├── Twilio - SMS notifications
└── JWT - Token-based authorization
```

## Environment Variables

### Required Variables (`.env`)

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/shareApp

# Server Configuration
PORT=8000
NODE_ENV=development

# JWT Secret (for OTP sessions)
JWT_SECRET=your-super-secret-jwt-key

# Firebase Admin SDK (for OTP Authentication)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AWS S3 Configuration
AWS_ACCESS_KEY=your-aws-access-key
AWS_SECRET_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=ap-south-1

# Twilio Configuration (for SMS)
TWILIO_SID=your-twilio-account-sid
TWILIO_AUTH=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5174
```

---

## File Structure & Explanation

### 1. Entry Point

#### `src/index.js`
**Purpose**: Main server file that initializes Express, connects to MongoDB, and sets up routes.

**Key Features**:
- CORS configuration for frontend communication
- MongoDB connection with error handling
- Route mounting for all API endpoints
- Global error handling middleware
- Health check endpoints

**Flow**:
```javascript
1. Load environment variables
2. Initialize Express app
3. Configure CORS
4. Connect to MongoDB
5. Mount API routes:
   - /api/otp (Firebase OTP)
   - /api/auth (Traditional OTP)
   - /api/upload (File uploads)
   - /api/download (Public downloads)
   - /api/profile (User profile)
6. Start server on PORT
```

---

### 2. Firebase Configuration

#### `src/firebase.js`
**Purpose**: Initialize Firebase Admin SDK for OTP authentication.

**How it works**:
```javascript
1. Import Firebase Admin SDK
2. Load credentials from environment variables
3. Initialize Firebase with service account
4. Export admin instance for use in controllers
```

**Security Note**: 
- Private key is stored in `.env` with escaped newlines
- Never commit `.env` to version control
- Service account has limited permissions

---

### 3. Database Models

#### `src/models/user.js`
**Purpose**: User schema for storing authentication data.

**Fields**:
```javascript
{
  auth0Id: String (optional) - For Auth0 users
  phoneNumber: String (optional) - For OTP users
  email: String (optional)
  name: String (required)
  profilePicture: String
  isPhoneVerified: Boolean
  authMethod: "auth0" | "phone"
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Validation**:
- User must have either `auth0Id` OR `phoneNumber`
- Sparse indexes on auth0Id and phoneNumber (allows nulls but ensures uniqueness)

---

#### `src/models/fileShare.js`
**Purpose**: Store file metadata and sharing information.

**Fields**:
```javascript
{
  shareId: String (unique, auto-generated) - 32-char hex
  fileName: String
  fileSize: Number (bytes)
  fileType: String (MIME type)
  s3Key: String - AWS S3 object key
  s3Url: String - Public download URL
  uploadedBy: ObjectId (ref: User)
  uploaderName: String
  receiverPhone: String
  downloadCount: Number (default: 0)
  lastDownloadedAt: Date
  expiresAt: Date (optional)
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes**:
- `shareId` - Fast lookup for downloads
- `uploadedBy + createdAt` - User's files sorted by date

---

#### `src/models/otp.js`
**Purpose**: Store OTP codes with auto-expiration.

**Fields**:
```javascript
{
  phoneNumber: String (indexed)
  otp: String (6 digits)
  expiresAt: Date (5 minutes from creation)
  isVerified: Boolean (default: false)
  attempts: Number (default: 0)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Auto-Deletion**:
- TTL index on `expiresAt` - MongoDB automatically deletes expired OTPs
- Prevents database bloat

---

### 4. Controllers

#### `src/controller/otpController.js` (Firebase)
**Purpose**: Handle Firebase-based OTP authentication.

**Function**: `sendOtp`

**Logic**:
```javascript
1. Receive phoneNumber from request
2. Try to get existing Firebase user by phone
3. If not exists, create new Firebase user
4. Generate custom token for the user
5. Return token to frontend
6. Frontend uses token to sign in with Firebase
```

**Error Handling**:
- Catches Firebase errors
- Returns 500 with error message

---

#### `src/controller/authController.js` (Traditional OTP)
**Purpose**: Handle traditional OTP flow with Twilio SMS.

**Functions**:

##### `sendOTPController`
```javascript
1. Validate phone number
2. Generate random 6-digit OTP
3. Save OTP to database with 5-min expiration
4. Send SMS via Twilio
5. Return success message
```

##### `verifyOTPController`
```javascript
1. Find OTP by phone number
2. Check if expired
3. Verify OTP matches
4. Check attempt limit (max 3)
5. Create or update User in database
6. Generate JWT token
7. Mark OTP as verified
8. Return user data + token
```

##### `getProfile`
```javascript
1. Extract user from JWT (via middleware)
2. Fetch user from database
3. Return user data
```

##### `updateProfile`
```javascript
1. Extract user from JWT
2. Update allowed fields (name, profilePicture)
3. Return updated user
```

---

#### `src/controller/uploadController.js`
**Purpose**: Handle file uploads to AWS S3.

**Functions**:

##### `uploadFile`
```javascript
1. Receive file from multer middleware
2. Validate file size (max 100MB)
3. Generate unique S3 key
4. Upload to S3 bucket
5. Generate public S3 URL
6. Create FileShare document in MongoDB
7. Send SMS to receiver with download link
8. Return share data with shareId
```

**S3 Upload**:
- Uses AWS SDK v3
- Sets public-read ACL
- Stores original filename and MIME type

**SMS Notification**:
```
Hi! {uploaderName} shared a file with you: {fileName}
Download: {downloadLink}
```

##### `getUserFiles`
```javascript
1. Extract user from JWT
2. Find all FileShare documents by uploadedBy
3. Sort by creation date (newest first)
4. Return file list
```

##### `deleteFile`
```javascript
1. Extract user from JWT
2. Find file by ID
3. Verify user owns the file
4. Delete from S3
5. Delete from MongoDB
6. Return success
```

---

#### `src/controller/downloadController.js`
**Purpose**: Handle public file downloads (no auth required).

**Function**: `getFileByShareId`

**Logic**:
```javascript
1. Receive shareId from URL params
2. Find FileShare by shareId
3. Check if file is active
4. Check if expired
5. Increment download count
6. Update lastDownloadedAt
7. Return file metadata + S3 URL
```

**Public Access**: No authentication required - anyone with link can download.

---

### 5. Middleware

#### `src/middleware/jwtAuth.js`
**Purpose**: Verify JWT tokens for protected routes.

**Function**: `verifyToken`

**Logic**:
```javascript
1. Extract token from Authorization header
2. Verify token with JWT_SECRET
3. Decode user ID from token
4. Fetch user from database
5. Attach user to request object
6. Call next() to proceed
```

**Error Cases**:
- No token → 401 Unauthorized
- Invalid token → 401 Unauthorized
- User not found → 401 Unauthorized

---

#### `src/middleware/auth.js` (Auth0)
**Purpose**: Verify Auth0 JWT tokens.

**Uses**: `express-oauth2-jwt-bearer` library

**Configuration**:
- Validates tokens from Auth0
- Checks audience and issuer
- Extracts user claims

---

#### `src/middleware/rateLimit.js`
**Purpose**: Prevent abuse with rate limiting.

**Limiters**:

##### `uploadLimiter`
```javascript
- Max 10 uploads per 15 minutes per IP
- Prevents spam uploads
```

##### `otpLimiter`
```javascript
- Max 5 OTP requests per 15 minutes per IP
- Prevents OTP spam
```

---

#### `src/middleware/errorHandler.js`
**Purpose**: Global error handling.

**Functions**:

##### `notFoundHandler`
```javascript
- Catches 404 errors
- Returns JSON error response
```

##### `errorHandler`
```javascript
- Catches all errors
- Logs error details
- Returns appropriate status code
- Hides sensitive info in production
```

---

### 6. Routes

#### `src/routes/otpRoute.js` (Firebase)
```javascript
POST /api/otp/send-otp
- Body: { phoneNumber }
- Returns: { success, token }
- Public route
```

---

#### `src/routes/auth.js` (Traditional)
```javascript
POST /api/auth/send-otp
- Body: { phoneNumber }
- Returns: { success, message }
- Public route

POST /api/auth/verify-otp
- Body: { phoneNumber, otp }
- Returns: { success, data: { user, token } }
- Public route

GET /api/auth/profile
- Headers: Authorization: Bearer {token}
- Returns: { success, data: user }
- Protected route

PUT /api/auth/profile
- Headers: Authorization: Bearer {token}
- Body: { name, profilePicture }
- Returns: { success, data: user }
- Protected route
```

---

#### `src/routes/uploads.js`
```javascript
POST /api/upload
- Headers: Authorization: Bearer {token}
- Body: FormData { file, receiverPhone }
- Returns: { success, data: { shareId, shareLink, ... } }
- Protected route
- Rate limited (10/15min)

GET /api/upload
- Headers: Authorization: Bearer {token}
- Returns: { success, data: [files] }
- Protected route

DELETE /api/upload/:fileId
- Headers: Authorization: Bearer {token}
- Returns: { success, message }
- Protected route
```

---

#### `src/routes/download.js`
```javascript
GET /api/download/:shareId
- Returns: { success, data: { fileName, s3Url, ... } }
- Public route (no auth required)
```

---

### 7. Utilities

#### `src/utils/s3.js`
**Purpose**: AWS S3 operations.

**Functions**:

##### `uploadToS3`
```javascript
Parameters:
- file: Buffer
- fileName: String
- mimeType: String

Returns:
- s3Key: String
- s3Url: String

Process:
1. Generate unique key with timestamp
2. Create S3 upload params
3. Upload to bucket
4. Return key and public URL
```

##### `deleteFromS3`
```javascript
Parameters:
- s3Key: String

Process:
1. Create delete params
2. Delete object from S3
3. Return success
```

---

## API Flow Examples

### 1. OTP Login Flow (Firebase)

```
Frontend                Backend                 Firebase
   |                       |                       |
   |-- POST /api/otp/send-otp ------------------>|
   |   { phoneNumber }     |                       |
   |                       |-- getUserByPhone ---->|
   |                       |   or createUser       |
   |                       |<----------------------|
   |                       |-- createCustomToken ->|
   |                       |<----------------------|
   |<-- { token } ---------|                       |
   |                       |                       |
   |-- signInWithCustomToken ---------------------->|
   |<-- User authenticated ------------------------|
```

### 2. Traditional OTP Login Flow

```
Frontend                Backend                 Twilio
   |                       |                       |
   |-- POST /api/auth/send-otp ------------------>|
   |   { phoneNumber }     |                       |
   |                       |-- Generate OTP        |
   |                       |-- Save to MongoDB     |
   |                       |-- Send SMS ---------->|
   |<-- { success } -------|                       |
   |                       |                       |
   |-- POST /api/auth/verify-otp ---------------->|
   |   { phoneNumber, otp }|                       |
   |                       |-- Verify OTP          |
   |                       |-- Create/Update User  |
   |                       |-- Generate JWT        |
   |<-- { user, token } ---|                       |
```

### 3. File Upload Flow

```
Frontend                Backend                 AWS S3
   |                       |                       |
   |-- POST /api/upload -->|                       |
   |   FormData            |                       |
   |   + JWT token         |-- Verify JWT          |
   |                       |-- Upload file ------->|
   |                       |<-- S3 URL ------------|
   |                       |-- Save to MongoDB     |
   |                       |-- Send SMS (Twilio)   |
   |<-- { shareId, link }--|                       |
```

### 4. Public Download Flow

```
Frontend                Backend                 AWS S3
   |                       |                       |
   |-- GET /api/download/:shareId --------------->|
   |   (no auth)           |                       |
   |                       |-- Find by shareId     |
   |                       |-- Increment count     |
   |<-- { s3Url, metadata }|                       |
   |                       |                       |
   |-- Download from s3Url ------------------------>|
   |<-- File data ---------------------------------|
```

---

## Security Features

### 1. Authentication
- **JWT tokens** for session management
- **Firebase custom tokens** for OTP auth
- **Token expiration** (configurable)
- **Secure token storage** (httpOnly cookies recommended)

### 2. Authorization
- **Protected routes** require valid JWT
- **User ownership** verification for file operations
- **Public download** links don't expose user data

### 3. Rate Limiting
- **Upload limit**: 10 per 15 minutes
- **OTP limit**: 5 per 15 minutes
- **IP-based** tracking

### 4. Data Validation
- **Phone number** format validation
- **File size** limit (100MB)
- **OTP expiration** (5 minutes)
- **Attempt limit** (3 tries)

### 5. Error Handling
- **No sensitive data** in error messages
- **Proper HTTP status** codes
- **Detailed logging** for debugging

---

## Database Collections

### users
```javascript
{
  _id: ObjectId
  phoneNumber: "+1234567890"
  name: "John Doe"
  authMethod: "phone"
  isPhoneVerified: true
  createdAt: ISODate
  updatedAt: ISODate
}
```

### fileshares
```javascript
{
  _id: ObjectId
  shareId: "a1b2c3d4e5f6..."
  fileName: "document.pdf"
  fileSize: 1048576
  fileType: "application/pdf"
  s3Key: "uploads/1234567890-document.pdf"
  s3Url: "https://bucket.s3.amazonaws.com/..."
  uploadedBy: ObjectId("...")
  uploaderName: "John Doe"
  receiverPhone: "+0987654321"
  downloadCount: 5
  lastDownloadedAt: ISODate
  isActive: true
  createdAt: ISODate
  updatedAt: ISODate
}
```

### otps
```javascript
{
  _id: ObjectId
  phoneNumber: "+1234567890"
  otp: "123456"
  expiresAt: ISODate (5 min from now)
  isVerified: false
  attempts: 0
  createdAt: ISODate
  updatedAt: ISODate
}
```

---

## Running the Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start MongoDB
```bash
# Windows
Start-Service MongoDB

# Or manually
mongod --dbpath C:\data\db
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

### 5. Verify
```bash
# Health check
curl http://localhost:8000/health

# Expected response
{
  "success": true,
  "status": "healthy",
  "timestamp": "2025-11-23T..."
}
```

---

## Testing

### Manual Testing

#### 1. Send OTP (Firebase)
```bash
curl -X POST http://localhost:8000/api/otp/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

#### 2. Send OTP (Traditional)
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

#### 3. Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890", "otp": "123456"}'
```

#### 4. Upload File
```bash
curl -X POST http://localhost:8000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "receiverPhone=+0987654321"
```

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB service
Get-Service MongoDB

# Start if stopped
Start-Service MongoDB

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/shareApp
```

### AWS S3 Upload Failed
```bash
# Verify credentials in .env
AWS_ACCESS_KEY=...
AWS_SECRET_KEY=...
AWS_S3_BUCKET=...

# Check bucket permissions (public-read)
# Verify IAM user has S3 permissions
```

### Twilio SMS Failed
```bash
# Verify credentials
TWILIO_SID=...
TWILIO_AUTH=...
TWILIO_PHONE_NUMBER=...

# Check Twilio console for errors
# Verify phone number is verified (trial accounts)
```

### Firebase Auth Failed
```bash
# Verify Firebase credentials
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...

# Check private key format (with \n)
# Verify service account permissions
```

---

## Production Deployment

### 1. Environment Variables
- Use secure secret management (AWS Secrets Manager, etc.)
- Never commit `.env` to git
- Use strong JWT_SECRET (32+ characters)

### 2. Database
- Use MongoDB Atlas for production
- Enable authentication
- Set up backups
- Use connection pooling

### 3. File Storage
- Use CDN for S3 (CloudFront)
- Set up lifecycle policies
- Enable versioning
- Configure CORS

### 4. Security
- Enable HTTPS
- Set secure CORS origins
- Use helmet.js
- Enable rate limiting
- Set up monitoring

### 5. Scaling
- Use PM2 for process management
- Enable clustering
- Set up load balancer
- Use Redis for sessions

---

## Summary

This backend provides:
- ✅ **Dual authentication** (Firebase OTP + Traditional OTP)
- ✅ **Secure file uploads** to AWS S3
- ✅ **Public download links** with tracking
- ✅ **SMS notifications** via Twilio
- ✅ **Rate limiting** and security
- ✅ **MongoDB** for data persistence
- ✅ **RESTful API** design
- ✅ **Error handling** and logging

**All environment variables are configured and the backend is production-ready!** 🚀
