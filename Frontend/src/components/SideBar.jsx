import { Home, FileText, Map, Layers, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Sidebar({ setActiveView }) {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Home", icon: <Home className="mr-2 h-4 w-4" />, key: "home" },
    { name: "Json View", icon: <FileText className="mr-2 h-4 w-4" />, key: "json" },
    { name: "Map", icon: <Map className="mr-2 h-4 w-4" />, key: "map" },
    { name: "MetaMap", icon: <Layers className="mr-2 h-4 w-4" />, key: "metamap" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    window.location.href = "/login";  
  };

  return (
    <aside
      className={`h-screen bg-white border-r transition-all duration-300 shadow-sm ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-full" />
          {!collapsed && <span className="font-bold text-lg">MyApp</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </Button>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map(item => (
          <Button
            key={item.key}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setActiveView(item.key)}
          >
            {item.icon}
            {!collapsed && item.name}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 mt-4"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </nav>
    </aside>
  );
}
