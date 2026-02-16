import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { axiosInstance } from '../lib/axios';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  PaginatedGridLayout,
  CallControls,
  useCallStateHooks,
  CallingState,
  ParticipantView,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Loader2, PhoneOff } from 'lucide-react';

const MyUILayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="ml-4 text-xl">Joining call...</span>
      </div>
    );
  }

  return (
    <StreamTheme>
      <PaginatedGridLayout />
      <CallControls onLeave={() => navigate('/chat')} />
    </StreamTheme>
  );
};

export default function VideoCallPage() {
  const { authUser } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const callId = searchParams.get('callId');

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser || !callId) {
      navigate('/');
      return;
    }

    const initVideo = async () => {
      try {
        // 1. Get token from backend
        const response = await axiosInstance.post('/video/token', {
          userId: authUser._id,
          userName: authUser.fullName,
        });

        const { token, apiKey } = response.data;

        if (!token || !apiKey) {
          throw new Error('Failed to get token or API key');
        }

        // 2. Initialize Stream Client
        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const streamClient = new StreamVideoClient({ apiKey, user, token });
        setClient(streamClient);

        // 3. Create/Join Call
        const streamCall = streamClient.call('default', callId);
        await streamCall.join({ create: true });
        setCall(streamCall);

      } catch (err) {
        console.error('Error initializing video call:', err);
        setError(err.message || 'Failed to initialize video call');
      }
    };

    initVideo();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [authUser, callId]); // Removed client dependency to avoid re-init

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
        <p className="mb-6">{error}</p>
        <button
          onClick={() => navigate('/chat')}
          className="bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Return to Chat
        </button>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black text-white">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>
    </div>
  );
}