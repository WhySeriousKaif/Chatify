import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,

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
    }



}));

