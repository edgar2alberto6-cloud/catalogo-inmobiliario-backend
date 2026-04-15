import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-red-500 font-semibold mb-2">
            Error de visualización
          </p>

          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No se pudo mostrar esta sección
          </h2>

          <p className="text-gray-600 leading-relaxed">
            Ocurrió un problema inesperado al renderizar este bloque. La página
            sigue funcionando, pero esta parte no pudo cargarse correctamente.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;