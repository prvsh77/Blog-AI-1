import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { userRegister } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            return toast.error('Please fill in all fields');
        }

        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }

        try {
            setLoading(true);

            await userRegister({
                name,
                email,
                password
            });

            toast.success('Registration successful');
            navigate('/login');

        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message ||
                'Registration failed'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
            >
                <h1 className="text-3xl font-bold text-center mb-6">
                    Create Account
                </h1>

                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-3 rounded mb-4"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-3 rounded mb-6"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 text-white p-3 rounded"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="mt-4 text-center">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-red-600 font-semibold"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Register;