import { EvaluacionScreen } from '../components/screens/EvaluacionScreen';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Desempeño → "/desempeno" */
export default function Desempeno() {
  const { goScreen, goTo } = useScreenNavigate();
  return <EvaluacionScreen onNavigate={goScreen} onSelectEmployee={(id) => goTo(`/personas/${id}`)} />;
}
