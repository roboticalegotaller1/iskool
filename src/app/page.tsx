import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { landingJsonLd, landingMetadata } from "@/lib/landing/metadata";
import HomeClient from "./HomeClient";

export const metadata: Metadata = landingMetadata;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeClient landing={<Landing />} />
    </>
  );
}
