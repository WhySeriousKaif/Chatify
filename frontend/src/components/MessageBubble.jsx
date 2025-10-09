import React from 'react';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn }) => {
    const formatTime = (timestamp) => {
        return format(new Date(timestamp), 'HH:mm');
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar for other user's messages */}
                {!isOwn && (
                    <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                        <img 
                            src={message.sender?.profilePic || "/avatar.png"} 
                            alt={message.sender?.fullName || "User"}
                            className='w-full h-full object-cover'
                        />
                    </div>
                )}

                {/* Message bubble */}
                <div className={`relative px-4 py-2 rounded-2xl ${
                    isOwn 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                        : 'bg-slate-700 text-slate-200'
                }`}>
                    {/* Message content */}
                    {message.text && (
                        <p className='text-sm leading-relaxed break-words'>{message.text}</p>
                    )}
                    
                    {/* Image message */}
                    {message.image && (
                        <div className='mt-2'>
                            <img 
                                src={message.image} 
                                alt="Shared image"
                                className='max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                                onClick={() => window.open(message.image, '_blank')}
                            />
                        </div>
                    )}

                    {/* Time stamp */}
                    <div className={`text-xs mt-1 ${
                        isOwn ? 'text-cyan-100' : 'text-slate-400'
                    }`}>
                        {formatTime(message.createdAt)}
                    </div>

                    {/* Message status for own messages */}
                    {isOwn && (
                        <div className='absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center'>
                            <svg className='w-2 h-2 text-white' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                            </svg>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
