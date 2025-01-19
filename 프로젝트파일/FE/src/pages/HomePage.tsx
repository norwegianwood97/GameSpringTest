import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const HomePage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          username,
          password,
        }
      );
      if (response.status === 200) {
        sessionStorage.setItem("userId", response.data.userId);
        sessionStorage.setItem("username", response.data.username);
        navigate("/main");
      }
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      <h1> Login Page</h1>
      <div>
        <input
          type="text"
          placeholder="ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div>
        <button onClick={handleLogin}>Sign in</button>
      </div>
      <div>
        <button onClick={() => navigate("/signup")}>Sign up</button>
      </div>
    </div>
  );
};

export default HomePage;
