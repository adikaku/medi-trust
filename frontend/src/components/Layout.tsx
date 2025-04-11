
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2025 MediTrust. All rights reserved.</p>
          <p className="mt-1">Helping you find affordable medicine alternatives.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
