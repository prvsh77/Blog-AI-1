import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { currentUser, axios, userToken, setCurrentUser } = useAppContext();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setAvatarPreview(currentUser.avatar.startsWith('http') ? currentUser.avatar : `${import.meta.env.VITE_BASE_URL}${currentUser.avatar}`);
        }
    }, [currentUser]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            const { data } = await axios.put(`${import.meta.env.VITE_BASE_URL}/api/user/profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setCurrentUser(prev => ({ ...prev, ...data }));
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex items-center space-x-6">
                        <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <span>Change Avatar</span>
                            <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm" />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500">Joined on: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Bookmarked articles: {currentUser.bookmarks?.length || 0}</p>
                        <p className="text-sm text-gray-500">Reading history: {currentUser.readingHistory?.length || 0}</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={loading}
                            className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;