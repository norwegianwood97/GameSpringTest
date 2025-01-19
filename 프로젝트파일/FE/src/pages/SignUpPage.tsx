// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import axios from "axios";

const SignUpPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/signup",
        {
          username,
          password,
        }
      );

      if (response.status === 201) {
        // 회원가입 성공 시 기본 화면으로 돌아가거나 원하는 페이지로 이동
        window.location.href = "/";
      }
    } catch (err) {
      setError("Sign-up failed. Please try again.");
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}
    >
      {error && <p>{error}</p>}
      <form onSubmit={handleSignUp}>
        <h1> Signup Page</h1>
        <div>
          <input
            id="username"
            type="text"
            placeholder="ID"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
};

export default SignUpPage;
