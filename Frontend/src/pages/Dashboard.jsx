
import MainBar from "@/components/Mainbar";
import Sidebar from "@/components/SideBar";
import { useState } from "react";


export default function Dashboard() {
  const [activeView, setActiveView] = useState("home");

  return (
    <div className="flex h-screen">
      <Sidebar setActiveView={setActiveView} activeView={activeView} />
      <MainBar activeView={activeView} />
    </div>
  );
}
