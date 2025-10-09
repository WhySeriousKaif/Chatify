import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    checkAuth: async () => {
       try{
        const response = await axiosInstance.get("/auth/check")
        set({authUser:response.data.user,isCheckingAuth:false})
       }catch(error){
        console.log(error)
        set({authUser:null,isCheckingAuth:false})
       }finally{
        set({isCheckingAuth:false})
       }

    },
    signup: async (formData) => {
        try{
            set({isSigningUp:true})
            const response = await axiosInstance.post("/auth/signup",formData)
            set({authUser:response.data})
            toast.success("Signup successful")
        }catch(error){
            console.log(error)
            set({isSigningUp:false})
            toast.error("Signup failed")
        }
        finally{
            set({isSigningUp:false})
        } 
    },
    login:async(formData)=>{
        try{
            set({isLoggingIn:true})
            const response = await axiosInstance.post("/auth/login",formData)
            set({authUser:response.data})
            toast.success("Login successful")
        }
        catch(error){
            console.log(error)
            set({isLoggingIn:false})
            toast.error("Login failed")
        }
        finally{
            set({isLoggingIn:false})
        }
    },
    logout: async () => {
        try{
            set({isLoggingOut:true})
            const response = await axiosInstance.post("/auth/logout")
            set({authUser:null})
            toast.success("Logout successful")
        }
        catch(error){
            console.log(error)
            set({isLoggingOut:false})
            toast.error("Logout failed")
        }
        finally{
            set({isLoggingOut:false})
        }
    }



}));

