import {createContext, useContext, useEffect, useState, useMemo} from 'react'
import axios from "axios";
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast';
import Loader from '../components/Loader';



// axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;
axios.interceptors.request.use((config) => {
    config.headers = {
        ...config.headers,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-None-Match': null
    };
    return config;
});

const AppContext = createContext();

export const AppProvider = ({ children })=>{

    const navigate = useNavigate()

    const [token, setToken] = useState(localStorage.getItem('token'))
    const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
    const [currentUser, setCurrentUser] = useState(null);
    const [blogs, setBlogs] = useState([])
    const [input, setInput] = useState("")
    const [loading,setLoading] = useState(false)

    useEffect(() => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          localStorage.removeItem('currentUser');
        }
      }
    }, []);

const fetchBlogs = async () => {
  try {
    setLoading(true);

    const timestamp = new Date().getTime();

    const response = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/api/blog/all`,
      {
        params: { timestamp }
      }
    );

    console.log("FULL RESPONSE:", response);
    console.log("RESPONSE DATA:", response.data);

    const data = response.data;

    if (data.success) {
      console.log("BLOGS RECEIVED:", data.blogs);
      console.log("BLOG COUNT:", data.blogs?.length);

      setBlogs(data.blogs);
    } else {
      console.log("API RETURNED SUCCESS FALSE");
      toast.error(data.message);
    }
  } catch (error) {
    console.error("FETCH BLOGS ERROR:", error);
  } finally {
    setLoading(false);
  }
};

    const userLogin = async (credentials) => {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/user/login`, credentials);
      if (data.success) {
        setUserToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      }
      return data;
    };

    const userRegister = async (userData) => {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/user/register`, userData);
      return data;
    };

    const userLogout = () => {
      setUserToken(null);
      setCurrentUser(null);
      localStorage.removeItem('userToken');
      localStorage.removeItem('currentUser');
      delete axios.defaults.headers.common['Authorization'];
      toast.success("Logged out successfully");
    };

    useEffect(()=>{
        fetchBlogs();
        const token = localStorage.getItem('token')
        if(token){
            setToken(token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else if (userToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        }
    },[userToken])

    const value = useMemo(() => ({
        axios, navigate, token, setToken, blogs, setBlogs, input, setInput,
        userToken, setUserToken, currentUser, setCurrentUser, userLogin, userRegister, userLogout
    }), [navigate, token, blogs, input, userToken, currentUser]);


 
    return (
        <AppContext.Provider value={value}>
             {loading ? <Loader /> : children}
        </AppContext.Provider>
    )
}

export const useAppContext = ()=>{
    return useContext(AppContext)
};
