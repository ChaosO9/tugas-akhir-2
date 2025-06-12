import type React from "react";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DbConfigProvider } from "@/lib/db-config-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FHIR Interoperability Dashboard",
  description:
    "Dashboard untuk monitoring interoperabilitas antara Rekam Medis Elektronik Mandiri dengan Platform SATUSEHAT",
  generator: "v0.dev",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DbConfigProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <div className="flex min-h-screen">
                <AppSidebar />
                <div className="flex-1">{children}</div>
              </div>
            </SidebarProvider>
            <Toaster />
          </DbConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
