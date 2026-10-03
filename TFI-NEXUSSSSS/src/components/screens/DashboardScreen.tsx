import React, { useState } from 'react';
import { ScreenId } from '../../types';
import { QuickGuideBanner } from '../QuickGuideBanner';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2026');

  return (
    <div className="w-full px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs tracking-wider text-primary uppercase font-extrabold">
              Vista General &bull; Resumen Ejecutivo
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary border border-primary/20">
              NEXUS Talento
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight font-headline flex items-center gap-3">
            Panel Principal y Estado del Equipo
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              94.8% Efectividad General
            </span>
          </h1>
          <p className="text-sm text-outline mt-1 max-w-3xl">
            Resumen visual y accesible sobre el desempeño del personal, cursos de capacitación, puestos de trabajo y candidatos en selección.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-container-high text-on-surface border border-outline-variant/40 outline-hidden cursor-pointer"
            aria-label="Seleccionar período"
          >
            <option value="Q3 2026">Q3 2026 (Trimestre anterior)</option>
            <option value="Q4 2026">Q4 2026 (Trimestre actual activo)</option>
            <option value="Q1 2027">Q1 2027 (Próximo trimestre proyectado)</option>
          </select>
          <button
            onClick={() => onNavigate('talent-map')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-sm">hub</span>
            Ver Mapa de Talento
          </button>
        </div>
      </div>

      {/* Friendly Guide Banner */}
      <QuickGuideBanner
        title="¿Cómo usar este panel principal?"
        description="Este panel reúne en un solo lugar la información más importante de la empresa para que tomes decisiones con facilidad."
        tips={[
          'Revisá los 4 números principales para conocer el promedio de evaluación, puestos cubiertos y capacitaciones.',
          'Hacé clic en cualquiera de las tarjetas de módulos para ingresar directamente a esa sección.',
          'En "Novedades y Acciones Sugeridas" encontrarás recordatorios prácticos que podés resolver con un solo clic.',
        ]}
      />

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Promedio de Desempeño</span>
            <div className="text-2xl font-black text-on-surface mt-1">4.62 / 5.0</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +0.3 vs evaluación anterior
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">star</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Puestos Críticos Cubiertos</span>
            <div className="text-2xl font-black text-on-surface mt-1">92.4%</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              13 de 14 roles con responsable
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Retorno en Capacitación</span>
            <div className="text-2xl font-black text-primary mt-1">3.4x Retorno</div>
            <div className="text-[11px] text-primary font-medium mt-1">
              42 empleados completaron cursos
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined text-xl">school</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Estabilidad y Retención</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">97.9%</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-1">
              Bajo riesgo de rotación
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-xl">sentiment_satisfied</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Direct Navigation Modules & Actionable Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Functional Modules Direct Access */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/40 shadow-xs">
            <h2 className="text-base font-extrabold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">apps</span>
              Secciones del Sistema
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => onNavigate('talent-map')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">hub</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">1. Mapa de Talento</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Conexión visual interactiva entre los colaboradores, las habilidades que dominan y los puestos de trabajo.
                </p>
              </div>

              <div
                onClick={() => onNavigate('empleados')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">group</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">2. Directorio de Empleados</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Fichas individuales completas, datos de contacto, supervisor, habilidades observables y registro de evaluaciones.
                </p>
              </div>

              <div
                onClick={() => onNavigate('puestos')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">work</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">3. Puestos de Trabajo</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Catálogo de cargos de la organización, responsabilidades, nivel salarial y botón para crear nuevos puestos.
                </p>
              </div>

              <div
                onClick={() => onNavigate('value-map')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">schema</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">4. Cadena de Valor</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Las 5 etapas clave de trabajo de la empresa (datos, desarrollo, operaciones, ventas y soporte) y sus responsables.
                </p>
              </div>

              <div
                onClick={() => onNavigate('reclutamiento')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">person_search</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">5. Reclutamiento de Personal</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Seguimiento de candidatos por etapa (Revisión, Entrevista, Oferta) y compatibilidad con el puesto.
                </p>
              </div>

              <div
                onClick={() => onNavigate('capacitacion-upskilling')}
                className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border border-outline-variant/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                    <span className="material-symbols-outlined">trending_up</span>
                  </span>
                  <span className="text-xs font-black text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Abrir sección &rarr;
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-on-surface">6. Cursos y Capacitación</h3>
                <p className="text-xs text-outline mt-1 leading-relaxed">
                  Planes formativos para cerrar brechas de conocimiento y registrar el avance de cada colaborador.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Suggested Actions and Alerts */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container p-6 rounded-3xl border border-primary/20 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-base">notifications_active</span>
              </span>
              <h3 className="text-sm font-black text-on-surface">Novedades y Acciones Sugeridas</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Atención Requerida
                  </span>
                  <span className="text-[10px] text-outline">Operaciones</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  El área de Logística y Servidores necesita reforzar sus conocimientos en seguridad de clústeres de servidores (Kubernetes).
                </p>
                <button
                  onClick={() => onNavigate('value-map')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver área en Cadena de Valor</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Candidato Destacado
                  </span>
                  <span className="text-[10px] text-outline">Reclutamiento</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  Mateo Silveira completó todas las etapas de entrevista con 96% de compatibilidad.
                </p>
                <button
                  onClick={() => onNavigate('reclutamiento')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Revisar candidato y extender oferta</span>
                  <span>&rarr;</span>
                </button>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-2xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Capacitación
                  </span>
                  <span className="text-[10px] text-outline">Cursos</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  Ing. Lucas Valenzuela alcanzó un 88% de avance en su curso de Gestión de Costos en la Nube.
                </p>
                <button
                  onClick={() => onNavigate('capacitacion-upskilling')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver seguimiento de cursos</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
