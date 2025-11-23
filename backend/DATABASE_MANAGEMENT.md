# MongoDB Database Management Guide

## Quick Reference

Your MongoDB localhost is configured and running:
- **Database Name**: `shareApp`
- **Connection URI**: `mongodb://localhost:27017/shareApp`
- **Status**: ✅ Running

## Database Management Commands

### Using the CLI Tool

```powershell
# Show database statistics
node src/manage-db.js stats

# List all collections with details
node src/manage-db.js collections

# View recent users
node src/manage-db.js users

# View recent file shares
node src/manage-db.js shares

# Show database indexes
node src/manage-db.js indexes

# Show everything
node src/manage-db.js all

# Clear all data (⚠️ WARNING: Destructive!)
node src/manage-db.js clear
```

### Using MongoDB Shell (mongosh)

```powershell
# Connect to MongoDB
mongosh

# Switch to shareApp database
use shareApp

# Show all collections
show collections

# View users
db.users.find().pretty()

# View file shares
db.fileshares.find().pretty()

# View OTPs
db.otps.find().pretty()

# Count documents
db.users.countDocuments()
db.fileshares.countDocuments()

# Find specific user by email
db.users.findOne({ email: "user@example.com" })

# Find file shares by uploader
db.fileshares.find({ uploaderName: "John Doe" })

# Delete specific document
db.users.deleteOne({ _id: ObjectId("...") })

# Clear collection
db.users.deleteMany({})

# Exit
exit
```

### Using MongoDB Compass (GUI)

1. Open **MongoDB Compass**
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**
4. Navigate to **shareApp** database
5. Browse collections visually

## Database Schema

### Collections

#### 1. **users**
Stores user authentication and profile data
- `auth0Id` - Auth0 user identifier
- `phoneNumber` - Phone number for OTP users
- `email` - User email
- `name` - User name
- `profilePicture` - Profile image URL
- `isPhoneVerified` - Phone verification status
- `authMethod` - "auth0" or "phone"

#### 2. **fileshares**
Stores file sharing metadata
- `shareId` - Unique shareable link ID
- `fileName` - Original file name
- `fileSize` - File size in bytes
- `fileType` - MIME type
- `s3Key` - AWS S3 object key
- `s3Url` - AWS S3 URL
- `uploadedBy` - Reference to User
- `uploaderName` - Uploader's name
- `receiverPhone` - Receiver's phone number
- `downloadCount` - Number of downloads
- `lastDownloadedAt` - Last download timestamp
- `expiresAt` - Optional expiration date
- `isActive` - Active status

#### 3. **otps**
Stores OTP codes for authentication
- `phoneNumber` - Phone number
- `otp` - OTP code
- `expiresAt` - Expiration timestamp (5 minutes)
- `isVerified` - Verification status
- `attempts` - Number of verification attempts

## MongoDB Service Management

```powershell
# Check service status
Get-Service MongoDB

# Start MongoDB
Start-Service MongoDB

# Stop MongoDB
Stop-Service MongoDB

# Restart MongoDB
Restart-Service MongoDB
```

## Backend Server Commands

```powershell
# Start development server
npm run dev

# Test database connection
node src/test-db-connection.js

# Manage database
node src/manage-db.js [command]
```

## Common Tasks

### View Database Statistics
```powershell
node src/manage-db.js stats
```

### Check Recent Activity
```powershell
node src/manage-db.js all
```

### Monitor File Uploads
```powershell
node src/manage-db.js shares
```

### Check User Registrations
```powershell
node src/manage-db.js users
```

## Troubleshooting

### Connection Issues
```powershell
# 1. Check MongoDB service
Get-Service MongoDB

# 2. Start if stopped
Start-Service MongoDB

# 3. Test connection
node src/test-db-connection.js
```

### Port Already in Use
```powershell
# Find process using port 27017
netstat -ano | findstr :27017

# Kill process if needed
taskkill /PID <process_id> /F
```

## Files Reference

- [manage-db.js](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/src/manage-db.js) - Database management CLI
- [test-db-connection.js](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/src/test-db-connection.js) - Connection test script
- [.env](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/.env) - Environment configuration
- [User Model](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/src/models/user.js)
- [FileShare Model](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/src/models/fileShare.js)
- [OTP Model](file:///c:/Users/Dell/OneDrive/Desktop/file-share-app/backend/src/models/otp.js)
