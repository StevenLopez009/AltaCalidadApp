import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <Image
          src="/images/logo1.png"
          alt="Gran Calidad"
          width={48}
          height={48}
          className="object-contain p-2"
        />
      </div>

      <div className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-wide text-white">ALTA</span>
        <span className="text-sm font-medium tracking-[0.3em] ">CALIDAD</span>
      </div>
    </div>
  );
}
