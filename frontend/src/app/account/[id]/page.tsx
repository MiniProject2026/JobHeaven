"use client";
import { user_service } from "@/context/AppContext";
import { User } from "@/type";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useState } from "react";

const UserAccount = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  async function fetchUser() {
    try {
      const { data } = await axios.get(`${user_service}/api/user/${id}`);
    } catch (error) {
      console.error(error);
    }
  }
  return <div>UserAccount</div>;
};

export default UserAccount;
