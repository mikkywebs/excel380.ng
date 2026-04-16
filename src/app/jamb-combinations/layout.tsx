import { Metadata } from "next";

export const metadata: Metadata = {
  title: "JAMB Subject Combinations 2024 | Official Course Requirements",
  description: "Quickly find the correct 4 subjects for any university course in Nigeria. Search the official JAMB brochure for Engineering, Medicine, Arts, and more.",
  keywords: [
    "JAMB subject combinations", 
    "JAMB brochure 2024", 
    "Engineering subjects JAMB", 
    "Medicine subjects JAMB",
    "Law subjects JAMB",
    "Nigerian university requirements"
  ],
  openGraph: {
    title: "Official JAMB Subject Combinations Guide",
    description: "Discover the exact subjects you need for your university degree.",
    images: ["/og-combinations.png"],
  }
};

export default function CombinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
