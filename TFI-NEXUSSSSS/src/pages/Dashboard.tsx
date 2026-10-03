import { DashboardScreen } from '../components/screens/DashboardScreen';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Inicio / Panel principal → "/" */
export default function Dashboard() {
  const { goScreen } = useScreenNavigate();
  return <DashboardScreen onNavigate={goScreen} />;
}
