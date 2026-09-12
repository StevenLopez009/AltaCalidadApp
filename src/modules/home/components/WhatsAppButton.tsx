import { FaWhatsapp } from "react-icons/fa";

import { buildWhatsAppUrl } from "@/src/shared/config/contact";

const DEFAULT_MESSAGE =
  "Hola, vengo de su página web y quisiera más información sobre sus servicios.";

export function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppUrl(DEFAULT_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="
        group fixed bottom-5 right-5 z-50
        flex items-center gap-0
        rounded-full bg-[#25D366]
        py-3.5 pl-3.5 pr-3.5
        text-white
        shadow-[0_8px_30px_rgba(37,211,102,0.35)]
        transition-all duration-300
        hover:gap-2 hover:pr-5
        focus-visible:outline focus-visible:outline-2
        focus-visible:outline-offset-2 focus-visible:outline-white
        sm:bottom-7 sm:right-7
      "
    >
      <FaWhatsapp className="h-7 w-7 shrink-0" aria-hidden="true" />

      {/* El texto solo se despliega al pasar el cursor, para no tapar contenido. */}
      <span
        className="
          hidden max-w-0 overflow-hidden whitespace-nowrap
          text-sm font-bold
          transition-all duration-300
          group-hover:max-w-[180px]
          sm:inline
        "
      >
        Escríbenos
      </span>
    </a>
  );
}
