import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";

export function SocialSection() {
  const socialNetworks = [
    {
      name: "Instagram",
      icon: FaInstagram,
      href: "#",
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      href: "#",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedinIn,
      href: "#",
    },
    {
      name: "YouTube",
      icon: FaYoutube,
      href: "#",
    },
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      href: "#",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-8">
        <h2 className="mb-10 text-5xl font-black uppercase tracking-tight">
          Síguenos
        </h2>

        <div className="flex items-center gap-8">
          {socialNetworks.map(({ name, icon: Icon, href }) => (
            <a
              key={name}
              href={href}
              aria-label={name}
              className="text-white transition duration-300 hover:scale-110 hover:text-orange-400"
            >
              <Icon size={34} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
