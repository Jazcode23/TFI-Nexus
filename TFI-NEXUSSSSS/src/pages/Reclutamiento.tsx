import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ReclutamientoScreen } from '../components/screens/ReclutamientoScreen';
import { JOB_POSITIONS } from '../data/mockData';
import { useScreenNavigate } from '../hooks/useScreenNavigate';

/** Selección de Personal → "/reclutamiento" y "/reclutamiento/:jobCode" (puesto que se está cubriendo) */
export default function Reclutamiento() {
  const { jobCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { goScreen } = useScreenNavigate();

  if (jobCode && !JOB_POSITIONS.some((j) => j.code === jobCode)) return <Navigate to="/reclutamiento" replace />;

  return (
    <ReclutamientoScreen
      onNavigate={goScreen}
      selectedJobCode={jobCode}
      onChangeJobCode={(code) => navigate(`/reclutamiento/${code}`, { replace: true, state: location.state })}
    />
  );
}
