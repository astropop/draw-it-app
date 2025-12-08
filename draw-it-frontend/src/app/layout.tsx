import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { Box, Typography } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Draw-it",
  description: "Draw-it created by Tai Le",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AppRouterCacheProvider options={{ prepend: true }}>
          {children}
          <Box
            sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}
          >
            <Typography variant='caption' color='text.secondary'>
              Author : Tai Le - Do not copy
            </Typography>
          </Box>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
