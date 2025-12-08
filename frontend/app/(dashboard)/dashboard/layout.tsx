import ProtectedRoute from "@/components/ProtectedRoutes/ProtectedRoutes";
import DashboardLayout from "./DashboardLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ProtectedRoute>
        <DashboardLayout>{children}</DashboardLayout>
      </ProtectedRoute>
    </div>
  );
}
