"use client";
import { AppContextType, AppProviderProps, User } from "@/type";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
export const utils_service = "http://localhost:5001";
export const auth_service = "http://localhost:5000";
export const user_service = "http://localhost:5002";
export const job_service = "http://localhost:5003";

const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  async function fetchUser() {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`${user_service}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }
async function updateProfilePic(fromData:any){
  const token = Cookies.get("token");
  setLoading(true);
  try{
const {data}=await axios.put(`${user_service}/api/user/update/pic`,fromData,{
  headers:{
    Authorization:`Bearer${token}`,
  },
});
toast.success(data.message);
fetchUser();
  }catch(error:any){
    toast.error(error.response.data.message);
  }
  finally{
    setLoading(false);
  }
}
async function updateResume(fromData:any){
  const token = Cookies.get("token");
  setLoading(true);
  try{
const {data}=await axios.put(`${user_service}/api/user/update/resume`,fromData,{
  headers:{
    Authorization:`Bearer${token}`,
  },
});
toast.success(data.message);
fetchUser();
  }catch(error:any){
    toast.error(error.response.data.message);
  }
  finally{
    setLoading(false);
  }
}
async function updateUser(name:string,phoneNumber:string,bio:string){
   const token = Cookies.get("token");
  setBtnLoading(true);
  try{
    const {data}=await axios.put(`${user_service}/api/user/update/profile`,{name,phoneNumber,bio},{
      headers:{
        Authorization:`Bearer ${token}`,
      },
    });
    toast.success(data.message);
    fetchUser();
  }catch(error:any){
    toast.error(error.response.data.message);
  }finally{
    setBtnLoading(false);
  }
}
  async function logoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("Logged out successfully");
  }
  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        btnLoading,
        setUser,
        isAuth,
        setIsAuth,
        setLoading,
        logoutUser,
        updateProfilePic,
        updateResume,
        updateUser,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};
export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppData must be used within AppProvider");
  return context;
};
