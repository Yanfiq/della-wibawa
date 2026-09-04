import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SMARTA UMKM — Catat Keuangan, Tingkatkan Keuntungan" },
      {
        name: "description",
        content:
          "SMARTA UMKM membantu pemilik usaha dagang & jasa mencatat keuangan, memisahkan keuangan pribadi dari usaha, dan menganalisa laba rugi secara otomatis.",
      },
      { property: "og:title", content: "SMARTA UMKM — Catat Keuangan, Tingkatkan Keuntungan" },
      {
        property: "og:description",
        content:
          "Pencatatan keuangan sederhana untuk UMKM dagang dan jasa: laporan laba rugi otomatis dan Uji Coba Gratis 30 Hari.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/smarta.html"
      title="SMARTA UMKM"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }}
    />
  );
}
