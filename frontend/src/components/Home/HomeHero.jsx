function HomeHero({ backgroundImage, children }) {
  const softTextShadow = "0 2px 10px rgba(0, 0, 0, 0.35)";
  const strongTextShadow = "0 4px 18px rgba(0, 0, 0, 0.45)";

  return (
    <section className="relative min-h-[620px] overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : "linear-gradient(135deg, #2f5e43 0%, #1f3f2d 100%)",
        }}
      />

      <div className="absolute inset-0 bg-black/45" />

      <div className="relative max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[620px] flex flex-col justify-center">
        <div className="text-center text-white max-w-4xl mx-auto">
          <p
            className="uppercase tracking-[0.25em] text-base md:text-lg text-[#e8d8ac] font-semibold"
            style={{ textShadow: softTextShadow }}
          >
            Yaxché Desarrolladora Inmobiliaria
          </p>

          <h1
            className="mt-4 text-5xl md:text-7xl font-bold leading-tight"
            style={{ textShadow: strongTextShadow }}
          >
            Encuentra tu inmueble ideal
          </h1>

          <p
            className="mt-5 text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed"
            style={{ textShadow: softTextShadow }}
          >
            Explora casas, terrenos y departamentos con filtros rápidos y una
            vista clara de todo el inventario disponible.
          </p>
        </div>

        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default HomeHero;