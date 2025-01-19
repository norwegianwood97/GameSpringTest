import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import UserListPage from "./pages/UserListPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import MainPage from "./pages/MainPage.tsx";
import DMPage from "./pages/DMPage.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/dm/:userId" element={<DMPage />} />
      </Routes>
    </Router>
  );
}

export default App;
