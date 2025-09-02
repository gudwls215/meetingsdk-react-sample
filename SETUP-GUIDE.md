# Zoom Meeting SDK Setup Guide

This guide helps you properly configure the Zoom Meeting SDK React application following security best practices.

## Security Notice

⚠️ **IMPORTANT**: Never expose your SDK Secret in client-side code! The signature must be generated on a secure backend server.

## Prerequisites

1. **Zoom Account**: You need a Zoom account with Meeting SDK privileges
2. **Meeting SDK App**: Create a Meeting SDK app in the [Zoom Marketplace](https://marketplace.zoom.us/)
3. **Backend Server**: Set up a secure server to generate JWT signatures

## Step 1: Get Your Credentials

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in and create a new "Meeting SDK" app
3. Get your credentials:
   - **SDK Key** (Client ID) - Safe to use in frontend
   - **SDK Secret** - Must be kept secure on backend only

## Step 2: Set Up Authentication Server

You need a backend server to generate JWT signatures. Here's a simple Node.js example:

```javascript
// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const SDK_KEY = 'your_sdk_key_here';
const SDK_SECRET = 'your_sdk_secret_here';

app.post('/', (req, res) => {
  const { meetingNumber, role } = req.body;
  
  const payload = {
    iss: SDK_KEY,
    alg: 'HS256',
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour
    aud: 'zoom',
    app_key: SDK_KEY,
    tokenExp: Math.floor(Date.now() / 1000) + (60 * 60),
    alg: 'HS256'
  };

  const signature = jwt.sign(payload, SDK_SECRET);
  res.json({ signature });
});

app.listen(4000, () => console.log('Auth server running on port 4000'));
```

## Step 3: Configure the React App

1. Open `src/App-New.tsx`
2. Update the configuration object:

```typescript
const config: MeetingConfig = {
  authEndpoint: "http://localhost:4000", // Your auth server URL
  sdkKey: "your_sdk_key_here", // Your actual SDK Key
  meetingNumber: "123456789", // Meeting number to join
  passWord: "", // Meeting password (if required)
  role: 0, // 0 = participant, 1 = host
  userName: "Your Name", // Display name
  userEmail: "", // Email (required for webinars)
  registrantToken: "", // For meetings requiring registration
  zakToken: "", // For starting meetings on behalf of users
};
```

## Step 4: Environment Variables (Recommended)

For production, use environment variables instead of hardcoded values:

1. Create a `.env` file:
```
VITE_ZOOM_SDK_KEY=your_sdk_key_here
VITE_AUTH_ENDPOINT=https://your-auth-server.com
VITE_MEETING_NUMBER=123456789
```

2. Update your config to use environment variables:
```typescript
const config: MeetingConfig = {
  authEndpoint: import.meta.env.VITE_AUTH_ENDPOINT || "http://localhost:4000",
  sdkKey: import.meta.env.VITE_ZOOM_SDK_KEY || "",
  meetingNumber: import.meta.env.VITE_MEETING_NUMBER || "",
  // ... other config
};
```

## Security Best Practices

1. ✅ **Use HTTPS** in production for all endpoints
2. ✅ **Keep SDK Secret secure** - only on backend
3. ✅ **Validate inputs** on both frontend and backend
4. ✅ **Implement rate limiting** on your auth server
5. ✅ **Use environment variables** for configuration
6. ✅ **Add CORS protection** for your auth endpoint
7. ✅ **Implement user authentication** before allowing meeting access

## Running the Application

1. Start your authentication server:
```bash
node server.js
```

2. Start the React application:
```bash
npm run dev
```

3. Navigate to `http://localhost:5173`

## Troubleshooting

### Common Issues

1. **"Authentication endpoint is required"**
   - Make sure your auth server is running
   - Check the `authEndpoint` URL in your config

2. **"SDK Key is required"**
   - Verify your SDK Key is correctly set
   - Check for any extra spaces or characters

3. **"Meeting number is required"**
   - Ensure you have a valid Zoom meeting number
   - The meeting must exist and be accessible

4. **CORS errors**
   - Add CORS headers to your auth server
   - Use the `cors` middleware in Express

### Authentication Errors

- Check that your SDK Secret is correct
- Verify the JWT payload structure
- Ensure your meeting number is valid
- Check that the meeting allows the specified role

## Additional Resources

- [Zoom Meeting SDK Documentation](https://developers.zoom.us/docs/meeting-sdk/)
- [Meeting SDK Authentication Guide](https://developers.zoom.us/docs/meeting-sdk/auth/)
- [Sample Authentication Server](https://github.com/zoom/meetingsdk-sample-signature-node.js)
