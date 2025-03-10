import { Anton } from "next/font/google";
import "../styles/globals.css";

const font = Anton({ weight: "400", style: "normal", subsets: ["latin"] });

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${font.className} ${font.className} antialiased`} >
        {children}
      </body>
    </html>
  );
}
