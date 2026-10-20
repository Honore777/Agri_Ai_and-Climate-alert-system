// auth.service.ts will be built here
import apiClient from "./api/axios";

import {ENDPOINTS} from '../config/api.config';

const authService={
    login: async(email:string, password:string)=>{
        const response=await apiClient.post(ENDPOINTS.login, {email,password});
        return response.data;
    },
    getCurrentUser: async()=>{
        const response=await apiClient.get(ENDPOINTS.ME);
        return response.data;
    },

    logout: async ()=>{
        const response=await apiClient.post(ENDPOINTS.LOGOUT);
        return response.data;
    }
}


export default authService;