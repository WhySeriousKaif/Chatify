import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://chatify-backend.onrender.com",
    withCredentials: true,
});