import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { currentUser, userLogout } = useAppContext();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        userLogout();
        navigate('/');
    };

    return (
        <div className='sticky top-0 z-50 w-full glass-nav px-8 sm:px-20 xl:px-32 py-4 flex justify-between items-center shadow-sm'>
            <img onClick={() => navigate('/')} src={assets.logo} alt="logo" className='w-32 sm:w-44 cursor-pointer hover:opacity-80 transition' />
            
            {currentUser ? (
                <div className="relative">
                    <img
                        src={currentUser.avatar.startsWith('http') ? currentUser.avatar : `${import.meta.env.VITE_BASE_URL}${currentUser.avatar}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full cursor-pointer"
                        onClick={() => setMenuOpen(!menuOpen)}
                    />
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                            <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</Link>
                            <Link to="/bookmarks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bookmarks</Link>

                            <Link to="/create-blog" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Create Blog</Link>

                            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-red-600">Login</Link>
                    <Link to="/register" className='flex items-center gap-2 rounded-full text-sm cursor-pointer glass-button text-white px-6 py-2 font-medium shadow'>
                        Register
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Navbar;


