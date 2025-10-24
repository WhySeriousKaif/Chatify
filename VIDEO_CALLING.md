# Video Calling Feature

This document describes the video calling functionality implemented using **ZegoCloud's Video SDK**.

## Overview

Chatify now uses ZegoCloud's professional video calling SDK instead of WebRTC, providing:
- ✅ More reliable connections
- ✅ Better quality video/audio
- ✅ Professional call controls
- ✅ Built-in participant management
- ✅ Call statistics and monitoring
- ✅ Production-ready scalability

## Features

- **Real-time video calling** using ZegoCloud's video SDK (@zegocloud/zego-uikit-prebuilt)
- **Multi-participant support** with speaker layout
- **Professional call controls** for mute/unmute, video on/off, and call management
- **Participant list** showing all call participants
- **Call statistics** and settings panel
- **Responsive design** that works on desktop and mobile
- **Seamless integration** with existing chat system
- **Client-side token generation** for simplicity
- **Automatic call reconnection** and error handling

## Setup

### Prerequisites

1. Create a ZegoCloud account at [zegocloud.com](https://zegocloud.com/)
2. Get your App ID and Server Secret from the [ZegoCloud Dashboard](https://zegocloud.com/console/)
3. Add environment variables to your frontend `.env` file

### Environment Variables

Add these to `frontend/.env`:

```env
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
```

**Note**: ZegoCloud uses client-side token generation for simplicity.

### Installation

The required packages are already installed:
- Frontend: `@zegocloud/zego-uikit-prebuilt`

## Usage

### Starting a Video Call

1. Navigate to the chat page
2. Select a conversation with a user
3. Click the video call button (📹) in the chat header
4. The video call page will load and automatically join the call

### Video Call Interface

The video call interface includes:

- **Top Bar**: Shows call ID, participant count, and recording status
- **Main Video Area**: Displays participants using Stream's speaker layout
- **Bottom Controls**: Call controls for mute, video, settings, and leave
- **Side Panels**: Participants list and settings/stats panel

### Call Controls

- **Mute/Unmute**: Toggle microphone
- **Video On/Off**: Toggle camera
- **Participants**: View participant list
- **Settings**: Access call statistics and settings
- **Leave Call**: End the call and return to chat

## Technical Implementation

### Backend Architecture

#### Stream Configuration (`backend/src/config/stream.js`)
- Initializes Stream Video client with API credentials
- Provides token generation functions
- Handles call creation and management

#### API Endpoints
- `GET /api/video/config` - Get Stream API configuration
- `POST /api/video/token` - Generate user token (protected route)
- `POST /api/video/create-call` - Create a video call (protected route)

### Frontend Architecture

#### Components

- `VideoCallPage.jsx`: Main video call page using Stream SDK
- `ChatHeader.jsx`: Integrated video call button

#### Dependencies

- `@stream-io/video-react-sdk`: Stream's React video SDK with UI components
- `react-router-dom`: Navigation between chat and video call
- `lucide-react`: Icons for UI
- `axios`: API calls for token generation

### Stream SDK Components Used

The implementation leverages Stream's production-ready components:

- **StreamVideoClient**: Main client for video functionality
- **StreamCall**: Call instance management and state
- **StreamVideo**: Provider component for React context
- **CallControls**: Built-in call control components (mute, video, leave)
- **SpeakerLayout**: Professional video layout with active speaker detection
- **CallParticipantsList**: Participant management UI
- **CallStatsButton**: Call quality and statistics monitoring

## Configuration

### Call ID Generation

Call IDs are automatically generated in `ChatHeader.jsx` based on user IDs:

```javascript
const callId = `call-${[userId1, userId2].sort().join('-')}`;
```

This ensures both users join the same room regardless of who initiates the call.

### Token Generation Flow

1. User clicks video call button
2. Frontend requests token from `/api/video/token`
3. Backend validates user authentication
4. Backend generates secure token using Stream SDK
5. Frontend receives token and initializes Stream client
6. User joins call with authenticated session

## Security Implementation

✅ **Server-side token generation**: Tokens are never exposed in client code
✅ **Protected routes**: All video endpoints require authentication
✅ **JWT verification**: User identity verified before token generation
✅ **Environment variables**: API secrets stored securely in `.env`
✅ **Token expiration**: Tokens expire after 24 hours by default

## Future Enhancements

- Server-side token generation
- Call invitation system
- Screen sharing
- Call recording
- Group video calls
- Call history and logs
- Push notifications for incoming calls
