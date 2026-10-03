import { ValueMapScreen } from '../components/screens/ValueMapScreen';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Áreas y Actividades (cadena de valor) → "/cadena-valor" */
export default function CadenaValor() {
  const { goScreen, goTo } = useScreenNavigate();
  return <ValueMapScreen onNavigate={goScreen} onSelectEmployee={(id) => goTo(`/personas/${id}`)} />;
}
