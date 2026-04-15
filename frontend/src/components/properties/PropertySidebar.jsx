function PropertySidebar({ property, whatsapp }) {
  if (!property) return null;

  const formatPrice = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
      return "Precio no disponible";
    }

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(number);
  };

  const handleWhatsapp = () => {
    if (!whatsapp) {
      alert("No hay WhatsApp configurado");
      return;
    }

    const message = `Hola, me interesa la propiedad: ${
      property.title || "Propiedad disponible"
    }`;

    const cleanWhatsapp = String(whatsapp).replace(/\D/g, "");
    const url = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md sticky top-6 space-y-5 border border-gray-100">
      {property.credit_type_display ? (
        <div className="inline-block bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          🏦 {property.credit_type_display}
        </div>
      ) : null}

      <p className="text-3xl font-bold text-gray-900">
        {formatPrice(property.price)}
      </p>

      {property.lot_price ? (
        <p className="text-green-600 font-semibold">
          Desde {formatPrice(property.lot_price)} por lote
        </p>
      ) : null}

      <div className="rounded-2xl bg-[#f4f8f5] border border-[#d7e7dc] p-5">
        <p className="text-sm uppercase tracking-[0.18em] text-[#3D7754] font-semibold mb-2">
          Contacto
        </p>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Te interesa esta propiedad?
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed">
          Ponte en contacto con nosotros para recibir más información, resolver
          dudas o agendar seguimiento.
        </p>

        <button
          onClick={handleWhatsapp}
          className="w-full h-12 mt-4 rounded-xl bg-[#3D7754] text-white font-semibold hover:brightness-95 transition"
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}

export default PropertySidebar;