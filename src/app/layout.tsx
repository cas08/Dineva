import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import Header from "@/components/shared/header";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/shared/query-provider";
import Footer from "@/components/shared/footer";
import React from "react";

export const metadata = {
  icons: {
    icon: "/dineva.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ua">
      <SessionProvider>
        <body className="min-h-screen flex flex-col">
          <Header />
          <NextTopLoader showSpinner={false} />
          <main className="flex-grow flex flex-col container mx-auto">
            <QueryProvider>{children}</QueryProvider>
            <Toaster
              position="top-center"
              containerStyle={{
                marginTop: 50,
              }}
            />
          </main>
          <Footer />
        </body>
      </SessionProvider>
    </html>
  );
}
