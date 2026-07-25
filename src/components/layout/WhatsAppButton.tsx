import { whatsappLink } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/ui/icons";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hello Oreste Utensils! I have a question about your kitchenware.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 left-5 z-40 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-card-hover transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      <IconWhatsApp className="h-6 w-6" />
    </a>
  );
}
