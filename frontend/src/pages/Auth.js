
import React, { useState } from "react";
import "./Auth.css";
import { login, register } from "../services/authService";


const Auth = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });


  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setFormData({ username: "", email: "", password: "" });
  };


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      if (isRegistering) payload.name = formData.name;


      const response = isRegistering
        ? await register(payload)
        : await login(payload);


      //alert(response.message || "Success!");


      if (response.token) {
        localStorage.setItem("token", response.token);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong.");
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegistering ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">
            {isRegistering ? "Register" : "Login"}
          </button>
        </form>
        <p onClick={toggleForm} className="toggle">
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
};


export default Auth;