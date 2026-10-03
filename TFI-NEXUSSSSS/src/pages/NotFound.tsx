import { Link, useNavigate } from 'react-router-dom';

/** Se muestra cuando la dirección no existe (por ejemplo, un enlace viejo o mal escrito). */
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-full px-6 lg:px-8 py-16 flex justify-center">
      <div className="max-w-md text-center flex flex-col items-center gap-4">
        <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl" aria-hidden="true">travel_explore</span>
        </span>
        <h1 className="text-xl font-black text-on-surface">No encontramos esta página</h1>
        <p className="text-sm text-on-surface-variant">
          Puede que el enlace esté incompleto o que la sección haya cambiado de lugar. Elegí una sección del menú o volvé al inicio.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant border border-outline-variant/40 hover:bg-surface-container cursor-pointer">
            Volver atrás
          </button>
          <Link to="/" className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
