import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function RankingsQr({ className }: { className?: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    void QRCode.toString(SITE_URL, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 1,
      color: { dark: "#1a1612", light: "#faf6ee" },
    }).then(setSvg);
  }, []);

  return (
    <div
      className={cn("table-card-qr overflow-hidden bg-surface", className)}
      role="img"
      aria-label="QR code for orlandochessrankings.com"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
