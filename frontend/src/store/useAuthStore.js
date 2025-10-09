import { create } from "zustand";

export const useAuthStore = create((set) => ({
    authUser: {name:"kaif",_id:"123",age:20},
    isLoading: false,
    isLoggedIn: false,
    
    login:()=>{
        console.log("we are logging in")
        set({isLoading:true})
        setTimeout(()=>{
            set({isLoading:false,isLoggedIn:true})
        },1000)
    },


}));

