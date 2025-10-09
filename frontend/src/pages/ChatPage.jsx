import React from 'react'
import { useAuthStore } from '../store/useAuthStore';

const ChatPage = () => {
  const { logout } = useAuthStore();
  return (
    <div className='flex flex-col items-center justify-center h-screen z-10'>
      <h1>Chat Page</h1>
      <button onClick={logout} className='btn btn-primary '>Logout</button>

    </div>
  )
}

export default ChatPage
