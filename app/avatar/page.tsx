import type { Metadata } from "next";
import AvatarPreview from "./AvatarPreview";

export const metadata: Metadata = {
  title: "X Avatar Export",
  robots: { index: false, follow: false },
};

export default function AvatarPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-zinc-900 px-6 py-12"
    >
      <AvatarPreview />
    </main>
  );
}
