import { useCallback } from 'react';
import { NavigateOptions, useLocation, useNavigate } from 'react-router-dom';
import { ScreenId } from '../types';
import { SCREEN_PATHS, getModuleByPath } from '../routes';

export interface FromState {
  from?: { path: string; label: string };
}

/**
 * Puente entre las pantallas existentes (que navegan con un ScreenId) y React Router.
 * Al navegar guarda de dónde viene el usuario para poder mostrar "Volver a ...".
 */
export function useScreenNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = useCallback(
    (path: string, options: NavigateOptions = {}) => {
      const label = getModuleByPath(location.pathname)?.title ?? 'Inicio';
      const state: FromState = { from: { path: location.pathname, label } };
      navigate(path, { state, ...options });
    },
    [navigate, location.pathname]
  );

  const goScreen = useCallback((screen: ScreenId) => goTo(SCREEN_PATHS[screen]), [goTo]);

  return { goTo, goScreen };
}
