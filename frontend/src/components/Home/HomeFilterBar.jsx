function HomeFilterBar({ filters, onChange, onSearch }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden border border-white/40">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7">
          <select
            name="listing_type"
            value={filters.listing_type}
            onChange={onChange}
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none bg-transparent"
          >
            <option value="">Operación</option>
            <option value="sale">Venta</option>
            <option value="rent">Renta</option>
          </select>

          <select
            name="property_type"
            value={filters.property_type}
            onChange={onChange}
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none bg-transparent"
          >
            <option value="">Tipo</option>
            <option value="house">Casa</option>
            <option value="land">Terreno</option>
            <option value="apartment">Departamento</option>
          </select>

          <select
            name="credit_type"
            value={filters.credit_type}
            onChange={onChange}
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none bg-transparent"
          >
            <option value="">Crédito</option>
            <option value="none">Ninguno</option>
            <option value="infonavit">INFONAVIT</option>
            <option value="fovissste">FOVISSSTE</option>
            <option value="both">INFONAVIT y FOVISSSTE</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={onChange}
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none bg-transparent"
          >
            <option value="">Estado</option>
            <option value="available">Disponible</option>
            <option value="pending">En proceso</option>
            <option value="sold">Vendido</option>
          </select>

          <input
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={onChange}
            placeholder="Desde"
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none"
          />

          <input
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={onChange}
            placeholder="Hasta"
            className="px-5 py-4 border-b xl:border-b-0 xl:border-r outline-none"
          />

          <button
            type="button"
            onClick={onSearch}
            className="px-6 py-4 bg-[#CCA352] hover:brightness-95 transition font-semibold text-white"
          >
            Buscar
          </button>
        </div>

        <div className="border-t">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={onChange}
            placeholder="Ingresa ubicación, ciudad o título"
            className="w-full px-5 py-4 outline-none"
          />
        </div>
      </div>
    </div>
  );
}

export default HomeFilterBar;