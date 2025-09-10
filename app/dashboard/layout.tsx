import { AuthProvider } from "@/app/context/AuthContext";

export default function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <section>{children}</section>
    </AuthProvider>
  );
}