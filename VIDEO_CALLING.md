# Video Calling Feature

This document describes the video calling functionality implemented using Stream's video SDK.

## Features

- **Real-time video calling** using Stream's video SDK
- **Multi-participant support** with speaker layout
- **Call controls** for mute/unmute, video on/off, and call management
- **Participant list** showing all call participants
- **Call statistics** and settings panel
- **Responsive design** that works on desktop and mobile
- **Integration with existing chat system**

## Setup

The video calling feature uses Stream's video SDK with the following configuration:

- **API Key**: `dz6h35yn9rrf`
- **Token**: Provided via URL parameters or default token
- **Call ID**: Generated from URL parameters or uses 'default-call'

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

### Components

- `VideoCallPage.jsx`: Main video call page component
- `VideoCallUI`: UI layout component with call controls
- Integration with existing `ChatHeader.jsx` for call initiation

### Dependencies

- `@stream-io/video-react-sdk`: Stream's React video SDK
- `react-router-dom`: For navigation
- `lucide-react`: For icons

### Stream SDK Integration

The implementation uses Stream's video SDK with:

- `StreamVideoClient`: Main client for video functionality
- `StreamCall`: Call instance management
- `StreamVideo`: Provider component
- `CallControls`: Built-in call control components
- `SpeakerLayout`: Video layout component
- `CallParticipantsList`: Participant management

## Configuration

### Environment Variables

You can configure the Stream integration by modifying the constants in `VideoCallPage.jsx`:

```javascript
const apiKey = 'your-stream-api-key';
const token = 'your-stream-token';
```

### Call ID Generation

Call IDs can be:
- Passed via URL parameters (`?callId=your-call-id`)
- Generated automatically using 'default-call'
- Customized based on user IDs or conversation IDs

## Security Notes

- The current implementation uses a hardcoded token for demonstration
- In production, tokens should be generated server-side for each user
- Implement proper authentication and authorization
- Use environment variables for API keys and sensitive configuration

## Future Enhancements

- Server-side token generation
- Call invitation system
- Screen sharing
- Call recording
- Group video calls
- Call history and logs
- Push notifications for incoming calls
