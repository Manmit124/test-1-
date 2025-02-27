
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import TawktoChat from "@/components/TawktoChat";
import { generateMetadata } from "@/utils/metadata";
import Header from "@/components/navigation/Header";

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body
        className="bg-background text-foreground min-h-screen flex flex-col"
        suppressHydrationWarning
      >

          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex items-center  justify-center container mx-auto px-4 py-8">
              {children}
            </main>
            <Toaster />
            <TawktoChat />
          </div>

      </body>
    </html>
  );
}
