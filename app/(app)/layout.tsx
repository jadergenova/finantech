import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAppSettings } from "@/lib/app-settings";
import { Sidebar } from "@/components/sidebar";
import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  const settings = await getAppSettings();

  return (
    <div className="flex min-h-screen">
      <Sidebar nomeSistema={settings.nomeSistema} logoBase64={settings.logoBase64} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={session.user?.name ?? ""} nomeSistema={settings.nomeSistema} logoBase64={settings.logoBase64} />
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 max-w-[1600px] w-full mx-auto">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
