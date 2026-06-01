
// src/components/Login.js
import React, { useState } from 'react';
import authService from './services/authService';
import { useAuth } from './AuthContext';
import { Link, useNavigate } from 'react-router-dom';
// import { FaUser, FaLock } from 'react-icons/fa';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import '../App.css'; // Create and import a CSS file for styling

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    authService.login(username, password)
      .then(response => {
        login(response);
        var user_name = localStorage.getItem('username');
        navigate("/");    
      })
      .catch(error => {
        console.log("logout successfully");
        // toast.error('Login failed');
      });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width:"100vw", height:"100vh" }}>
    <div className="login-container">
    <div><h4 style={{color: "white", fontWeight:"bolder", marginBottom:"20px"}}>Login Form</h4></div>
      
      <div className="input-container">
        {/* <FaUser /> */}
        <input
          type="text"
          placeholder="Type your username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="input-container">
        {/* <FaLock /> */}
        <input
          type="password"
          placeholder="Type your password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleLogin} className="btn btn-sm btn-warning">LOGIN</button>
      <div>
     
      </div>
     
    </div>
    
    </div>
  );
};

export default Login;


