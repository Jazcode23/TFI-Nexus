import React from 'react';
import { GLOSARIO, GlosarioKey } from '../data/glosario';

interface CompetenciaNombreProps {
  /** Clave de la competencia en el glosario. */
  competencia: GlosarioKey;
  /** Muestra el nombre técnico como información secundaria (por defecto sí). */
  mostrarTecnico?: boolean;
  className?: string;
  labelClassName?: string;
  technicalClassName?: string;
}

/**
 * Muestra una competencia con su nombre claro en español y, debajo, el
 * nombre técnico original como referencia secundaria.
 */
export const CompetenciaNombre: React.FC<CompetenciaNombreProps> = ({
  competencia,
  mostrarTecnico = true,
  className = '',
  labelClassName = '',
  technicalClassName = 'text-[11px] font-medium text-outline',
}) => {
  const { label, technical } = GLOSARIO[competencia];
  return (
    <span className={`block ${className}`}>
      <span className={`block ${labelClassName}`}>{label}</span>
      {mostrarTecnico && (
        <span className={`block ${technicalClassName}`}>{technical}</span>
      )}
    </span>
  );
};
