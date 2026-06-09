import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import './Auth.css';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    // 1. Email Validation
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // 2. Password Requirement: Min 6 chars, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      alert("Password must be at least 6 characters and include both letters and numbers.");
      return;
    }

    if (!isLogin) {
      // SIGN UP LOGIC
      const users = JSON.parse(localStorage.getItem("registered_users") || "[]");
      if (users.find(u => u.email === email)) {
        alert("Email already registered!");
        return;
      }

      // Save user to LocalStorage for Admin Panel access
      const newUser = { fullName, email, date: new Date().toLocaleString() };
      users.push(newUser);
      localStorage.setItem("registered_users", JSON.stringify(users));

      // 3. Trigger EmailJS Notification
      const templateParams = {
        to_name: fullName,
        to_email: email,
      };

      emailjs.send(
        "service_47b4m4n",    // Your Service ID
        "YOUR_TEMPLATE_ID",   // Replace with your Template ID
        templateParams,
        "55saiBlbeDwlUnthF"   // Your Public Key
      ).then(() => {
        alert("Registration successful! Welcome email sent.");
      }).catch((err) => {
        console.error("Email failed:", err);
      });
    }

    // Identify Admin Login
    const isAdmin = email === "admin@test.com" && password === "admin123";
    onLogin({ email, fullName, isAdmin });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? "Welcome Back!" : "Get Started"}</h2>
        <p className="auth-subtitle">{isLogin ? "Please enter your details" : "Create Account"}</p>
        
        <form onSubmit={handleAuth}>
          {!isLogin && (
            <div className="auth-input-wrapper">
              <span className="auth-icon-inline">👤</span>
              <input 
                type="text" placeholder="Full Name" className="auth-input" 
                value={fullName} onChange={(e) => setFullName(e.target.value)} required 
              />
            </div>
          )}
          <div className="auth-input-wrapper">
            <span className="auth-icon-inline">📧</span>
            <input 
              type="email" placeholder="E-mail" className="auth-input" 
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div className="auth-input-wrapper">
            <span className="auth-icon-inline">🔒</span>
            <input 
              type="password" placeholder="Password" className="auth-input" 
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>

          <button type="submit" className="auth-btn-main">
            {isLogin ? "Log in" : "Sign up"}
          </button>
        </form>
        
        <p className="auth-footer-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? " Sign Up" : " Log in"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;