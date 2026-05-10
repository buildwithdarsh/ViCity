import { permanentRedirect } from "next/navigation";

export default function RoomsPage() {
  permanentRedirect("/admin/rooms/types");
}
