# HALT Shelter Admin Key Authentication System

## Overview
This system provides secure admin panel access using a customizable admin key that generates real JWT tokens for authentication. You can change the admin key anytime without modifying code files.

## 🔑 Admin Key Management

### How to Change Admin Key

1. **Edit the Script**
   - Open `server/set-admin-key.js` in VS Code
   - Modify the `ADMIN_KEY` value:
   ```javascript
   // 🔑 CHANGE YOUR ADMIN KEY HERE
   const ADMIN_KEY = "your-new-admin-key-here";
   // 🔑 CHANGE YOUR ADMIN KEY HERE
   ```

2. **Run the Script**
   ```powershell
   cd "C:\Users\board\Desktop\Halt\halt-donation\server"
   node set-admin-key.js
   ```

3. **Restart the Server** (Required!)
   - Stop your server with `Ctrl+C`
   - Start it again with `node app.js`

4. **Test the New Key**
   ```powershell
   $body = @{ adminKey = "your-new-admin-key-here" } | ConvertTo-Json
   Invoke-RestMethod -Uri 'http://localhost:5000/api/admin-auth/admin-login' -Method POST -Body $body -ContentType 'application/json'
   ```

### Current Admin Key
- **Key**: `0219$0216!haltAdminKey`
- **Set on**: 2025-09-21
- **File location**: `server/admin-key.json`

## 🚀 Starting the Application

### 1. Start Backend Server
```powershell
cd "C:\Users\board\Desktop\Halt\halt-donation\server"
node app.js
```
Server will run on: `http://localhost:5000`

### 2. Start Admin Panel
```powershell
cd "C:\Users\board\Desktop\Halt\halt-donation\admin"
npm start
```
Admin panel will run on: `http://localhost:3002`

### 3. Start Main Website (Optional)
```powershell
cd "C:\Users\board\Desktop\Halt\halt-donation"
npm start
```
Main site will run on: `http://localhost:3001`

## 🔐 Admin Panel Login

1. **Open Admin Panel**: Go to `http://localhost:3002`
2. **Enter Admin Key**: Use your current admin key
3. **Click Login**: You'll receive a real JWT token for authentication

## 🧪 Testing Authentication

### Test Admin Key via Command Line
```powershell
# Test current admin key
$body = @{ adminKey = "0219$0216!haltAdminKey" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin-auth/admin-login' -Method POST -Body $body -ContentType 'application/json'

# Test endpoint availability
Invoke-RestMethod -Uri 'http://localhost:5000/api/admin-auth/test' -Method GET
```

### Expected Response (Success)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "admin",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### Expected Response (Invalid Key)
```json
{
  "error": "Invalid admin key"
}
```

## 📁 File Structure

```
server/
├── set-admin-key.js         # Script to change admin key
├── admin-key.json          # Stores current admin key (auto-generated)
├── app.js                  # Main server with direct auth routes
└── middleware/auth.js      # JWT authentication middleware

admin/
├── src/pages/Login.js      # Admin login interface
└── package.json           # Admin panel dependencies
```

## 🔧 Technical Details

### JWT Token Configuration
- **Secret**: Stored in `.env` as `JWT_SECRET`
- **Expiration**: 24 hours
- **Type**: `admin-key-auth` (special type for admin key authentication)

### Authentication Flow
1. User enters admin key in login form
2. Frontend sends POST request to `/api/admin-auth/admin-login`
3. Server reads `admin-key.json` file
4. If key matches, server generates JWT token
5. Token is returned and stored in frontend
6. All subsequent requests include JWT token in Authorization header

### Security Features
- ✅ Real JWT tokens (not fake tokens)
- ✅ Token expiration (24 hours)
- ✅ Secure admin key storage in JSON file
- ✅ CORS protection
- ✅ Admin role verification
- ✅ Password field with show/hide toggle

## 🛠️ Troubleshooting

### "Invalid admin key" Error
1. Check if you restarted the server after changing the key
2. Verify the key in `server/admin-key.json`
3. Ensure no typos in the admin key

### "Unable to connect to remote server" Error
1. Check if the server is running on port 5000
2. Run: `netstat -ano | findstr :5000` to verify
3. Restart the server if needed

### Admin Panel Not Loading
1. Check if admin panel is running on port 3002
2. Verify CORS settings in server configuration
3. Check browser console for errors

## 📝 Notes

- **Server Restart Required**: Always restart the server after changing admin keys
- **Separate Terminals**: Run commands in separate PowerShell windows to avoid server interference
- **File Permissions**: Ensure the server has write access to create `admin-key.json`
- **Environment Variables**: JWT_SECRET is loaded from `.env` file

## 🔒 Security Best Practices

1. **Use Strong Admin Keys**: Include special characters, numbers, and letters
2. **Change Keys Regularly**: Update admin keys periodically
3. **Don't Share Keys**: Keep admin keys confidential
4. **Monitor Access**: Check server logs for authentication attempts
5. **Use HTTPS in Production**: Enable SSL/TLS for production deployments

## 📞 Support

If you encounter issues:
1. Check server console logs for error messages
2. Verify all files are in correct locations
3. Ensure all dependencies are installed (`npm install`)
4. Restart both server and admin panel

---

**Last Updated**: September 21, 2025  
**Current System**: MERN Stack with MongoDB Atlas  
**Authentication**: JWT-based admin key system
