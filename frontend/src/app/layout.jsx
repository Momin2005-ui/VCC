import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "MyCourses — Course Registration Portal",
  description:
    "Register, manage, and track your courses with the MyCourses platform. Built for IIIT Dharwad.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
