import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getAppSettings } from "@/lib/app-settings";
import { getThemePreset } from "@/lib/theme-presets";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAppSettings();
  return {
    title: settings.nomeSistema,
    description: "Controle financeiro pessoal",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getAppSettings();
  const preset = getThemePreset(settings.temaPreset);

  return (
    <html lang="pt-BR" data-theme="dark" className={inter.variable}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `:root{--accent:${preset.accent};--accent2:${preset.accent2};}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
