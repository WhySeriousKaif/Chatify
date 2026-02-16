# MeetLy

MeetLy (formerly Chatify) is a modern, real-time messaging and video calling application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

-   **Real-time Messaging**: Instant text messaging powered by Socket.IO.
-   **Video Calling**: High-quality video calls using Stream Video SDK.
-   **Multimedia Support**: Share images and files easily.
-   **Responsive Design**: A sleek, mobile-friendly interface inspired by modern chat apps.
-   **Secure Authentication**: User accounts secured with JWT.

## Tech Stack

-   **Frontend**: React, Vite, Tailwind CSS, Zustand
-   **Backend**: Node.js, Express, MongoDB, Socket.IO
-   **Video/Audio**: Stream Video SDK
-   **Storage**: Cloudinary

## Getting Started

### Prerequisites

-   Node.js (v18+)
-   MongoDB instance
-   Stream API keys
-   Cloudinary account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/WhySeriousKaif/Chatify.git
    cd Chatify
    ```

2.  **Install Backend Dependencies**:
    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies**:
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Environment Variables**:
    Create `.env` files in both `backend` and `frontend` directories with the required keys (see `env.example` if available).

5.  **Run the App**:
    -   Backend: `npm run dev` (in `backend` folder)
    -   Frontend: `npm run dev` (in `frontend` folder)

## Deployment

-   **Backend**: deploy to Render (or similar).
-   **Frontend**: deploy to Netlify/Vercel.

## License

© 2026 MeetLy. All rights reserved.
