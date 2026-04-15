import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#f5f5f2]">
      <TopBar />

      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;