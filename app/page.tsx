import { redirect } from "next/navigation";

export default function HomePage() {
  // NEST Creative Delivery is a gallery-first product.
  // One-off clients receive their private /s/[token] link directly;
  // the root URL opens the gallery design preview, not an email login.
  redirect("/preview");
}
