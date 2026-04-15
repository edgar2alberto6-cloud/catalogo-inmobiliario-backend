function HomeInventoryCTA({ onClick }) {
  return (
    <div className="text-center py-10">
      <p className="text-lg text-gray-700">
        ¿O prefieres ver todo nuestro inventario?
      </p>

      <button
        type="button"
        onClick={onClick}
        className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#CCA352] text-white font-semibold hover:brightness-95 transition"
      >
        Ver inventario completo
      </button>
    </div>
  );
}

export default HomeInventoryCTA;