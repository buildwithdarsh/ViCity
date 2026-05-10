"use client";

import { FiMail } from "react-icons/fi";

export default function WhatsAppFloat() {
  return (
    <a
      href="mailto:hello@build.withdarsh.com"
      aria-label="Email Us"
      className="whatsapp-float hidden lg:flex"
    >
      <FiMail size={26} />
    </a>
  );
}
