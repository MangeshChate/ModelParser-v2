import Home from "./Home";
import JsonView from "./JsonView";
import Map from "./Map";
import MetaMap from "./MetaMap";

export default function MainBar({ activeView }) {
  const renderView = () => {
    switch (activeView) {
      case "home":
        return <Home />;
      case "json":
        return <JsonView />;
      case "map":
        return <Map />;
      case "metamap":
        return <MetaMap />;
      default:
        return <Home />;
    }
  };

  return (
    <main className="flex-1 bg-gray-50 p-10 overflow-auto">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 w-full p-6 rounded-2xl shadow-lg">
        {renderView()}
      </div>
    </main>
  );
}