import UserAppLayout from "@/app/components/UserAppLayout";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <UserAppLayout basePath="/app">{children}</UserAppLayout>;
}
