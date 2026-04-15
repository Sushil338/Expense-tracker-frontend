import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../api';
import { Lock, Eye, EyeOff, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ onLoginSuccess, onGoToRegister }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const oauthError = params.get('oauthError');
        const authError = sessionStorage.getItem('authError');

        if (oauthError) {
            setError(oauthError);
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (authError) {
            setError(authError);
            sessionStorage.removeItem('authError');
        }
    }, []);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleGoogleLogin = () => {
        const oauthBaseUrl = (API.defaults.baseURL || 'http://localhost:8080/api').replace(/\/api\/?$/, '');
        window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await API.post('/auth/login', credentials);
            const { token, username, id, user } = response.data;

            console.log("LOGIN RESPONSE:", response.data);

            if (token && username && id) {
                localStorage.setItem('token', token);
                localStorage.setItem('username', username);
                localStorage.setItem('userId', id);

                setAuthToken(token);
                onLoginSuccess(user || { username, id });
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (err) {
            console.error("Login Error:", err);

            const errorMessage = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || "Connection failed. Is the server running?";

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-600">Welcome Back</h2>
                    <p className="text-gray-500 mt-2">Log in to manage your budget</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm">
                        <AlertCircle className="mr-2" size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400">
                                <User size={18} />
                            </span>
                            <input
                                name="username"
                                type="text"
                                required
                                value={credentials.username}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2.5 border rounded-lg"
                                placeholder="Enter username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-400">
                                <Lock size={18} />
                            </span>
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                value={credentials.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2.5 border rounded-lg"
                                placeholder="Enter password"
                            />
                            <span
                                className="absolute right-3 top-3.5 text-gray-400 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-lg font-bold"
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                        {!loading && <ArrowRight className="ml-2" size={18} />}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-all"
                >
                    Continue with Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm">
                        Don't have an account?{' '}
                        <button
                            onClick={onGoToRegister}
                            className="text-blue-600 font-bold"
                        >
                            Register
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;
