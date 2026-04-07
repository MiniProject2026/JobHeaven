"use client";
import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React from "react";

const Accountpage = () => {
  const { isAuth, user, loading } = useAppData();
  if (loading) return <Loading />;
  return <div>Accountpage</div>;
};

export default Accountpage;
