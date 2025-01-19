import React, { useEffect, useState } from "react";

interface User {
  id: string; // userId (BE에서 숫자로 반환될 가능성 있음)
  username: string;
  createdAt: string;
}

interface UserListPageProps {
  startDM: (userId: string) => void; // DM 시작 함수
}

const UserListPage: React.FC<UserListPageProps> = ({ startDM }) => {
  const [users, setUsers] = useState<User[]>([]);
  const currentUserId = Number(sessionStorage.getItem("userId")); // 숫자로 변환

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        const data = await response.json();
        // 현재 사용자 제외
        const filteredUsers = data.filter(
          (user: User) => Number(user.id) !== currentUserId // 숫자 비교
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [currentUserId]);

  return (
    <div>
      <h2>User List</h2>
      {users.map((user) => (
        <div
          key={user.id}
          style={{
            border: "1px solid black", // 검정색 테두리
            backgroundColor: "white", // 흰 배경
            padding: "10px", // 내부 여백
            marginBottom: "10px", // 박스 간 간격
            borderRadius: "5px", // 박스 모서리 둥글게
            display: "flex", // Flexbox 활성화
            alignItems: "center", // 세로 정렬 중앙
            justifyContent: "space-between", // 요소 간 공간 균등 분배
          }}
        >
          <div style={{ display: "flex", gap: "15px", flex: 1 }}>
            <span>ID: {user.username}</span>
          </div>
          <div style={{ display: "flex", gap: "5px", flex: 3 }}>
            <span>
              가입날짜: {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          <button onClick={() => startDM(user.id)}>DM</button>
        </div>
      ))}
    </div>
  );
};

export default UserListPage;
