import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "HB Tools Hub",
  description: "כל הכלים, הסקילים והסוכנים של HB — במקום אחד",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Apply saved theme before first paint to avoid flash */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{if(localStorage.getItem('hb-theme')==='light'){document.documentElement.classList.add('light');}}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
