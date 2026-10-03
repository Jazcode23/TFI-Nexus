import { ReportesScreen } from '../components/screens/ReportesScreen';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Informes → "/reportes" */
export default function Reportes() {
  const { goScreen } = useScreenNavigate();
  return <ReportesScreen onNavigate={goScreen} />;
}
