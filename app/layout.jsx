import "./style.css";

export const metadata = { title: "Website Change Detector" };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
