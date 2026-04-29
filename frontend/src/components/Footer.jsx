import logoBlanco from "../assets/yaxche-logoblanco.png";

function Footer() {
  return (
    <footer className="bg-[#2f5f43] text-white border-t-4 border-[#CCA352]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Marca */}
          <div>
            <img
              src={logoBlanco}
              alt="Yaxché Desarrolladora Inmobiliaria"
              className="h-14 w-auto object-contain mb-5"
            />

            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Desarrolladora inmobiliaria enfocada en la promoción de
              propiedades, terrenos, lotes y oportunidades de inversión en
              Yucatán.
            </p>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-semibold uppercase tracking-wide border-b border-white/25 pb-2 mb-4">
              Información
            </h3>

            <div className="space-y-2 text-sm text-white/80">
              <p>Propiedades en venta y renta</p>
              <p>Casas, terrenos, lotes y hectáreas</p>
              <p>Atención personalizada</p>
              <p>Asesoría inmobiliaria</p>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-semibold uppercase tracking-wide border-b border-white/25 pb-2 mb-4">
              Contacto
            </h3>

            <div className="space-y-2 text-sm text-white/80">
              <p>Yucatán, México</p>
              <p>Atención por WhatsApp</p>
              <p>Consulta disponibilidad de propiedades</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/60">
          <p>
            Copyright © {new Date().getFullYear()} Yaxché Inmobiliaria. Todos los derechos
            reservados.
          </p>

          <p>Catálogo inmobiliario digital.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;