import React from 'react'
import { MessageCircleIcon, UsersIcon, SparklesIcon } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useNavigate } from 'react-router';

const NoConversationPlaceholder = () => {
  const { setActiveTab } = useChatStore();
  const navigate = useNavigate();

  const handleFindContacts = () => {
    setActiveTab('contacts');
  };

  return (
    <div className='flex flex-col items-center justify-center h-full px-8'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/5 rounded-full blur-xl animate-pulse' />
        <div className='absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/5 rounded-full blur-xl animate-pulse delay-1000' />
        <div className='absolute top-1/2 right-1/3 w-16 h-16 bg-violet-500/5 rounded-full blur-xl animate-pulse delay-500' />
      </div>

      {/* Main content */}
      <div className='relative z-10 flex flex-col items-center text-center space-y-8 max-w-md'>
        {/* Animated icon */}
        <div className='relative'>
          <div className='w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-cyan-500/30 animate-bounce'>
            <MessageCircleIcon className='w-12 h-12 text-cyan-400' />
          </div>
          {/* Floating sparkles */}
          <div className='absolute -top-2 -right-2 w-6 h-6 bg-yellow-400/20 rounded-full flex items-center justify-center animate-ping'>
            <SparklesIcon className='w-3 h-3 text-yellow-400' />
          </div>
          <div className='absolute -bottom-1 -left-1 w-4 h-4 bg-pink-400/20 rounded-full flex items-center justify-center animate-ping delay-300'>
            <SparklesIcon className='w-2 h-2 text-pink-400' />
          </div>
        </div>

        {/* Text content */}
        <div className='space-y-4'>
          <h3 className='text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent'>
            Welcome to Chatify
          </h3>
          <p className='text-slate-400 text-lg leading-relaxed'>
            Your conversations are waiting to begin
          </p>
          <p className='text-slate-500 text-sm'>
            Select a contact from the sidebar to start chatting
          </p>
        </div>

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row gap-4 w-full'>
          <button 
            onClick={handleFindContacts}
            className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20'
          >
            <UsersIcon className='w-5 h-5' />
            Find Contacts
          </button>
          
          <button 
            onClick={(e) => { e.preventDefault(); setActiveTab('chats'); navigate('/chat'); }}
            className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--wa-item)] text-[var(--wa-text)] rounded-xl font-medium border border-slate-800 hover:bg-[var(--wa-item-hover)] transition-all duration-300'>
            <MessageCircleIcon className='w-5 h-5' />
            Start Chat
          </button>
        </div>

        {/* Features list */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-xs text-slate-500'>
          <div className='flex items-center gap-2 justify-center'>
            <div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
            <span>Real-time messaging</span>
          </div>
          <div className='flex items-center gap-2 justify-center'>
            <div className='w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200' />
            <span>Secure & private</span>
          </div>
          <div className='flex items-center gap-2 justify-center'>
            <div className='w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500' />
            <span>Easy to use</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoConversationPlaceholder
