// src/components/Navigation.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

interface NavigationProps {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeMenu,
  setActiveMenu,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      console.log("Logging out user:", userId);
    }
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    navigate("/");
  };

  return (
    <nav>
      <button
        onClick={() => {
          setActiveMenu("Chat");
          navigate("/main"); // 메인 채팅 페이지
        }}
        style={{ fontWeight: activeMenu === "Chat" ? "bold" : "normal" }}
      >
        Chat
      </button>
      <button
        onClick={() => {
          setActiveMenu("Users");
          navigate("/main"); // 유저 리스트 페이지
        }}
        style={{ fontWeight: activeMenu === "Users" ? "bold" : "normal" }}
      >
        Users
      </button>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navigation;
