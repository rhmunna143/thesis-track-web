import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ErrorBoundary from "../components/common/ErrorBoundary";
import ClientShell from "../components/ClientShell";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ThesisTrack - Project Proposal & Review System",
  description:
    "A centralized platform for thesis proposal submission and review",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ErrorBoundary>
          <ClientShell>
            <AntdRegistry>{children}</AntdRegistry>
          </ClientShell>
        </ErrorBoundary>
      </body>
    </html>
  );
}
