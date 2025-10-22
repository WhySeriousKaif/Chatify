import React from 'react';
import { Video, Phone, X } from 'lucide-react';

const CallInvitation = ({ 
  callerName, 
  callerAvatar, 
  onAccept, 
  onDecline, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <img 
              src={callerAvatar || "/avatar.png"} 
              alt={callerName}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <h2 className="text-white text-xl font-semibold mb-2">
            Incoming Video Call
          </h2>
          <p className="text-gray-300">
            {callerName} is calling you
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onDecline}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
            Decline
          </button>
          
          <button
            onClick={onAccept}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
          >
            <Video className="w-5 h-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallInvitation;
