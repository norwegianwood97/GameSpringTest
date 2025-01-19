// src/pages/MainPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatPage from "./ChatPage.tsx";
import UserListPage from "./UserListPage.tsx";
import Navigation from "../components/Navigation.tsx";

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Chat");

  const startDM = (userId: string) => {
    navigate(`/dm/${userId}`); // DM 페이지로 이동
  };

  return (
    <div>
      <Navigation activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div>
        {activeMenu === "Chat" && <ChatPage />}
        {activeMenu === "Users" && <UserListPage startDM={startDM} />}
      </div>
    </div>
  );
};

export default MainPage;
