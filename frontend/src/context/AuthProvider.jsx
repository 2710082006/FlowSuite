import { useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem("flowsuite_user");

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("flowsuite_user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("flowsuite_token", token);
    localStorage.setItem(
      "flowsuite_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("flowsuite_token", token);
    localStorage.setItem(
      "flowsuite_user",
      JSON.stringify(user)
    );

    setUser(user);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("flowsuite_token");
    localStorage.removeItem("flowsuite_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}