import "./globals.css";

export const metadata = {
  title: "VAAGA'26.2.0 — Arts Day at CET Payyanur",
  description: "VAAGA'26.2.0 is the official Arts Day of College of Engineering Payyanur (CETP), a day of dance, music, theatre and art rooted in Kerala's culture.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
