import { Link, useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

/** Se muestra cuando la dirección no existe (por ejemplo, un enlace viejo o mal escrito). */
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="w-full px-6 lg:px-8 py-16 flex justify-center">
      <div className="max-w-md text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
          <Compass className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-bold text-on-surface tracking-tight">No encontramos esta página</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Puede que el enlace esté incompleto o que la sección haya cambiado de lugar. Elegí una sección del menú o volvé al inicio.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver atrás
          </Button>
          <Link to="/">
            <Button size="sm">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Ir al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
