import Sidebar from "@/app/components/ui/Sidebar";
import Topbar from "@/app/components/ui/Topbar";
import { AuthProvider } from "../context/AuthContext";

export default function DashboardLayout({ children }: any) {
  return (
     <AuthProvider>
    <div className="h-screen flex bg-gray-50">
      
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-y-auto">
       {children}
        </main>
      </div>
    </div>
    </AuthProvider>
  );
}
