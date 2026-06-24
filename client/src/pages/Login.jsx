import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const Login = () => {
const { userLogin } = useAppContext();
const navigate = useNavigate();

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
e.preventDefault();


try {
  setLoading(true);

  await userLogin({
    email,
    password
  });

  toast.success('Login successful');
  navigate('/');

} catch (error) {
  console.error(error);

  toast.error(
    error?.response?.data?.message ||
    'Invalid email or password'
  );
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen flex items-center justify-center px-4"> <form
     onSubmit={handleSubmit}
     className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
   > <h1 className="text-3xl font-bold text-center mb-6">
Login </h1>


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
      className="w-full border p-3 rounded mb-6"
    />

    <button
      type="submit"
      disabled={loading}
      className="w-full bg-red-600 text-white p-3 rounded"
    >
      {loading ? 'Logging In...' : 'Login'}
    </button>

    <p className="mt-4 text-center">
      Don't have an account?{' '}
      <Link
        to="/register"
        className="text-red-600 font-semibold"
      >
        Register
      </Link>
    </p>
  </form>
</div>

);
};

export default Login;
