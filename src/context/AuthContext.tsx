"use client";

import {
  createContext,
  useContext,
  useState,
    useEffect
} from "react";

import { User } from "@/data/auth";

type AuthContextType = {
  user: User | null;

  login: (
    email: string,
    password: string
  ) => void;

  signup: (
    fullName: string,
    email: string,
    password: string
  ) => void;

  logout: () => void;

  isLoggedIn: boolean;
};

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

type AuthProviderProps = {
  children: React.ReactNode;
};


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const savedUser = localStorage.getItem("currentUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const signup = (
    fullName: string,
    email: string,
    password: string
  ) => {

    const existingUsers: User[] =
      JSON.parse(localStorage.getItem("users") || "[]");

    const alreadyExists = existingUsers.find(
      (user) => user.email === email
    );

    if (alreadyExists) {
      throw new Error("Email already exists");
    }

    const newUser: User = {
      id: Date.now().toString(),
      fullName,
      email,
      password,
    };

    existingUsers.push(newUser);

    localStorage.setItem(
      "users",
      JSON.stringify(existingUsers)
    );

    localStorage.setItem(
      "currentUser",
      JSON.stringify(newUser)
    );

    setUser(newUser);
  };

  const login = (
  email: string,
  password: string
) => {
  const existingUsers: User[] =
    JSON.parse(localStorage.getItem("users") || "[]");

  const foundUser = existingUsers.find(
    (user) =>
      user.email === email &&
      user.password === password
  );

  if (!foundUser) {
    throw new Error("Invalid email or password");
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify(foundUser)
  );

  setUser(foundUser);
  };

  const logout = () => {
  localStorage.removeItem("currentUser");
  setUser(null);
  };

     const value = {
        user,
        login,
        signup,
        logout,
        isLoggedIn: !!user,
      }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;