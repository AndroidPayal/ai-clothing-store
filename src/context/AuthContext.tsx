"use client";

import {
  createContext,
  useState,
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
  ) => Promise<void>;

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

    const savedUser =
      localStorage.getItem("currentUser");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });


  // =========================
  // SIGNUP
  // =========================

  const signup = async (
    fullName: string,
    email: string,
    password: string
  ) => {

    const response = await fetch(
      "/api/auth/signup",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      }
    );


    const data =
      await response.json();


    if (!response.ok) {
      throw new Error(
        data.message ||
        "Signup failed"
      );
    }


    // User returned by MongoDB API
    const newUser: User = {
      id: data.user.id,
      fullName:
        data.user.fullName,
      email:
        data.user.email,
    };


    // Keep user logged in
    localStorage.setItem(
      "currentUser",
      JSON.stringify(newUser)
    );


    setUser(newUser);
  };


  // =========================
  // LOGIN
  // =========================

  const login = (
    email: string,
    password: string
  ) => {

    const existingUsers: User[] =
      JSON.parse(
        localStorage.getItem(
          "users"
        ) || "[]"
      );


    const foundUser =
      existingUsers.find(
        (user) =>
          user.email === email &&
          user.password === password
      );


    if (!foundUser) {
      throw new Error(
        "Invalid email or password"
      );
    }


    localStorage.setItem(
      "currentUser",
      JSON.stringify(foundUser)
    );


    setUser(foundUser);
  };


  // =========================
  // LOGOUT
  // =========================

  const logout = () => {

    localStorage.removeItem(
      "currentUser"
    );

    setUser(null);
  };


  const value = {
    user,
    login,
    signup,
    logout,
    isLoggedIn: !!user,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;