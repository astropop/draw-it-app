import { Box, Paper, Typography } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
          <Box
            sx={{
              p: 1,
              display: "flex",
            }}
          >
            <Paper elevation={3} sx={{ p: 2, textAlign: "center" }}>
              <Link href={"/"}>
                <Typography variant='h6' component='p' gutterBottom>
                  Draw-it
                </Typography>
              </Link>
            </Paper>
          </Box>
          {children}
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              textAlign: "center",
            }}
          >
            <Typography variant='caption' color='text.secondary'>
              Author : Tai Le - Draw it
            </Typography>
          </Box>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
