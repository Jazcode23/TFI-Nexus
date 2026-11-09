import React, { useEffect, useState } from 'react';
import { EmployeeProfile } from '../types';
import { UserAvatar } from './UserAvatar';
import { useFocusTrap } from './useFocusTrap';
import { Star, X, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/button';

interface EvaluationModalProps {
  employee: EmployeeProfile;
  onClose: () => void;
  onSave: () => void;
}

const inputClass =
  'w-full p-2.5 bg-surface-dim rounded-lg border text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs font-medium transition-colors';

/** Formulario de evaluación con estilo minimalista profesional */
export const EvaluationModal: React.FC<EvaluationModalProps> = ({ employee, onClose, onSave }) => {
  const [technical, setTechnical] = useState('');
  const [teamwork, setTeamwork] = useState('');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const parseScore = (v: string) => Number(v.replace(',', '.'));
  const validScore = (v: string) => v.trim() !== '' && parseScore(v) >= 1 && parseScore(v) <= 5;

  const errors = {
    technical: validScore(technical) ? '' : 'Ingresá una nota entre 1 y 5 (ej: 4.5).',
    teamwork: validScore(teamwork) ? '' : 'Ingresá una nota entre 1 y 5 (ej: 4.0).',
    comments: comments.trim().length >= 10 ? '' : 'Escribí al menos una frase con la devolución para el colaborador.',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!hasErrors) onSave();
  };

  const borderFor = (err: string) => (submitted && err ? 'border-error' : 'border-outline-variant/60');
  const FieldError = ({ text }: { text: string }) =>
    submitted && text ? (
      <p role="alert" className="text-[11px] text-error font-medium mt-1 flex items-center gap-1">
        <AlertCircle className="w-3.5 h-3.5" />
        {text}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="eval-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-bright max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-xl p-5 shadow-xl border border-outline-variant/70 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 id="eval-title" className="text-sm font-semibold text-on-surface">Registrar evaluación de desempeño</h3>
              <p className="text-[11px] text-outline">Puntaje y retroalimentación periódica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-dim text-outline transition-colors cursor-pointer" title="Cerrar" aria-label="Cerrar">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5 text-xs">
          <div className="flex items-center gap-3 p-3 bg-surface-dim rounded-lg border border-outline-variant/40">
            <UserAvatar name={employee.name} size="md" shape="rounded" />
            <div>
              <h4 className="font-semibold text-on-surface text-xs">{employee.name}</h4>
              <p className="text-outline text-[11px]">{employee.role} • {employee.area}</p>
            </div>
          </div>

          <div>
            <label htmlFor="eval-tech" className="font-semibold text-on-surface block mb-1">
              Habilidades técnicas del cargo (1 a 5) <span className="text-error">*</span>
            </label>
            <input id="eval-tech" type="text" inputMode="decimal" autoFocus value={technical} onChange={(e) => setTechnical(e.target.value)} placeholder="Ej: 4.5" aria-invalid={submitted && !!errors.technical} className={`${inputClass} ${borderFor(errors.technical)}`} />
            <FieldError text={errors.technical} />
          </div>

          <div>
            <label htmlFor="eval-team" className="font-semibold text-on-surface block mb-1">
              Trabajo en equipo y comunicación (1 a 5) <span className="text-error">*</span>
            </label>
            <input id="eval-team" type="text" inputMode="decimal" value={teamwork} onChange={(e) => setTeamwork(e.target.value)} placeholder="Ej: 4.0" aria-invalid={submitted && !!errors.teamwork} className={`${inputClass} ${borderFor(errors.teamwork)}`} />
            <FieldError text={errors.teamwork} />
          </div>

          <div>
            <label htmlFor="eval-comments" className="font-semibold text-on-surface block mb-1">
              Devolución para el colaborador <span className="text-error">*</span>
            </label>
            <textarea id="eval-comments" rows={3} value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Comentarios sobre desempeño y plan de mejora..." aria-invalid={submitted && !!errors.comments} className={`${inputClass} ${borderFor(errors.comments)} resize-none font-normal`} />
            <FieldError text={errors.comments} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              <Check className="w-3.5 h-3.5 mr-1" />
              Guardar evaluación
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
