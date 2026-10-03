import { TalentMapScreen } from '../components/screens/TalentMapScreen';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Talento y Habilidades → "/talento" */
export default function Talento() {
  const { goScreen, goTo } = useScreenNavigate();
  return <TalentMapScreen onNavigate={goScreen} onSelectEmployee={(id) => goTo(`/personas/${id}`)} />;
}
