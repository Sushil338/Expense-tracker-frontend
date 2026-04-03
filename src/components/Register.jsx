import React, { useState } from 'react';
import API from '../api';
import { User, Lock, Mail, IndianRupee, CheckCircle } from 'lucide-react';

const Register = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        monthlyBudget: ''
    });
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/register', formData);
            setSuccess(true);
            setTimeout(() => onBackToLogin(), 2000); // Redirect to login after 2 seconds
        } catch {
            alert("Registration failed. Username might be taken.");
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold">Account Created!</h2>
                    <p className="text-gray-500">Taking you to the login screen...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Join Budgeter</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input name="username" placeholder="Username" required className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input name="email" type="email" placeholder="Email Address" required className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input name="password" type="password" placeholder="Password" required className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                    </div>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input name="monthlyBudget" type="number" placeholder="Monthly Budget (Pocket Money)" required className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition-all">Create Account</button>
                </form>
                <button onClick={onBackToLogin} className="w-full mt-4 text-sm text-blue-500 hover:underline">Already have an account? Login</button>
            </div>
        </div>
    );
};

export default Register;
