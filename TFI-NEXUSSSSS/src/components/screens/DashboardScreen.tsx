import React, { useState, useEffect } from 'react';
import { ScreenId } from '../../types';
import { QuickGuideBanner } from '../QuickGuideBanner';
import { reportsApi } from '../../services/api';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2026');
  const [showGuide, setShowGuide] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [kpis, setKpis] = useState<{
    overallEffectiveness: string;
    averagePerformanceScore: string;
    criticalRolesCovered: string;
    criticalRolesDetail: string;
    trainingRoi: string;
    activeHeadcount: number;
    spofAlertsCount: number;
  }>({
    overallEffectiveness: '94.8%',
    averagePerformanceScore: '4.62 / 5.0',
    criticalRolesCovered: '92.4%',
    criticalRolesDetail: '13 de 14 roles con responsable',
    trainingRoi: '3.4x',
    activeHeadcount: 142,
    spofAlertsCount: 1,
  });
  const [loadingKpis, setLoadingKpis] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoadingKpis(true);
    reportsApi
      .getDashboardKpis(selectedQuarter)
      .then((data) => {
        if (isMounted && data) {
          setKpis({
            overallEffectiveness: data.overallEffectiveness || '94.8%',
            averagePerformanceScore: data.averagePerformanceScore || '4.62 / 5.0',
            criticalRolesCovered: data.criticalRolesCovered || '92.4%',
            criticalRolesDetail: data.criticalRolesDetail || '13 de 14 roles con responsable',
            trainingRoi: data.trainingRoi || '3.4x',
            activeHeadcount: data.activeHeadcount ?? 142,
            spofAlertsCount: data.spofAlertsCount ?? 1,
          });
        }
      })
      .catch((err) => {
        console.warn('Dashboard KPIs fallback a datos locales:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingKpis(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedQuarter]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    try {
      setIsExporting(true);
      showToast(`Generando reporte ejecutivo en ${format.toUpperCase()}...`);
      await reportsApi.downloadReport(format);
      showToast(`Reporte ${format.toUpperCase()} descargado exitosamente`);
    } catch {
      showToast('Descarga simulada generada correctamente');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 border border-outline-variant/30 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-secondary-container text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Executive Toolbar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] tracking-wider text-primary uppercase font-extrabold">
              Panel Operativo &bull; People Analytics
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-fixed text-primary border border-primary/20">
              NEXUS RRHH
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-on-surface tracking-tight font-headline flex flex-wrap items-center gap-2.5">
            Panel de Control y Analítica de Talento
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <span className={`w-2 h-2 rounded-full bg-emerald-500 ${loadingKpis ? 'animate-ping' : ''}`} />
              {kpis.overallEffectiveness} Salud General
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-outline mt-0.5">
            Monitoreo en tiempo real de atracción de postulantes, ciclo de evaluación 9-Box, planes formativos y roles críticos.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-container-high text-on-surface border border-outline-variant/40 outline-hidden cursor-pointer"
            aria-label="Seleccionar período"
          >
            <option value="Q3 2026">Q3 2026 (Trimestre anterior)</option>
            <option value="Q4 2026">Q4 2026 (Trimestre actual activo)</option>
            <option value="Q1 2027">Q1 2027 (Próximo proyectado)</option>
          </select>

          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showGuide
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
            }`}
            title="Alternar guía de orientación rápida"
          >
            <span className="material-symbols-outlined text-base">help_outline</span>
            <span>{showGuide ? 'Ocultar Guía' : 'Guía Rápida'}</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => handleExport('xlsx')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Descargar resumen consolidado en Excel"
          >
            <span className="material-symbols-outlined text-base text-emerald-600">table_view</span>
            <span>Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('reclutamiento')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-on-primary hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Publicar o gestionar vacantes abiertas"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>+ Nueva Vacante</span>
          </button>
        </div>
      </div>

      {/* Dismissible / Collapsible Quick Guide */}
      {showGuide && (
        <QuickGuideBanner
          title="Orientación para el Responsable de RRHH"
          description="Este panel reúne tus indicadores diarios de selección, desempeño, capacitación y alertas para resolver en un solo clic."
          tips={[
            'Revisá el Embudo de Selección para ver qué candidatos están listos para avanzar a oferta.',
            'Consultá la Matriz 9-Box para monitorear el balance de potencial vs desempeño del ciclo activo.',
            'En "Alertas Prioritarias" tenés acciones directas para mitigar riesgos de puestos sin sucesor (SPOF).',
          ]}
          dismissible={true}
          onDismiss={() => setShowGuide(false)}
        />
      )}

      {/* KPI Ribbon: 4 Core HR Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Efectividad General</span>
            <div className="text-2xl font-black text-on-surface mt-0.5">{kpis.averagePerformanceScore}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              +0.3 vs evaluación previa
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">workspace_premium</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Puestos Críticos Cubiertos</span>
            <div className="text-2xl font-black text-on-surface mt-0.5">{kpis.criticalRolesCovered}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {kpis.criticalRolesDetail}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-xl">verified_user</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Pipeline de Selección</span>
            <div className="text-2xl font-black text-primary mt-0.5">12 Candidatos</div>
            <div className="text-[11px] text-primary font-medium mt-1">
              3 vacantes en proceso
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">person_search</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-semibold text-outline">Resiliencia Organizacional</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {kpis.spofAlertsCount === 0 ? '100%' : '97.9%'}
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-amber-600">warning</span>
              {kpis.spofAlertsCount} alerta SPOF bajo control
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <span className="material-symbols-outlined text-xl">shield</span>
          </div>
        </div>
      </div>

      {/* Analytical Core: Recruitment Pipeline & 9-Box Distribution + Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Analytical Charts & Visual Flow (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Recruitment Funnel Widget */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">filter_alt</span>
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-on-surface">
                    Embudo de Selección Activo
                  </h2>
                  <p className="text-[11px] text-outline">
                    Atracción, filtrado y candidatos en fase de decisión (Q4)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('reclutamiento')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Pipeline Completo</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* Funnel Progress Bars */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary/60" />
                    1. Postulaciones Recibidas
                  </span>
                  <span className="text-outline">12 postulantes (100%)</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 rounded-full w-full" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    2. Evaluación Técnica y Habilidades
                  </span>
                  <span className="text-outline">7 en evaluación (58%)</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full w-[58%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    3. Terna Finalista con Entrevistas
                  </span>
                  <span className="text-outline">3 preseleccionados (25%)</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full w-[25%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                  <span className="text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    4. Listo para Oferta / Contratación
                  </span>
                  <span className="text-emerald-700 font-bold">1 candidato óptimo (8%)</span>
                </div>
                <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[8%]" />
                </div>
              </div>
            </div>

            {/* Highlighted Candidate Callout */}
            <div className="mt-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                  alt="Ing. Mateo Silveira"
                  className="w-10 h-10 rounded-xl object-cover border border-outline-variant/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">Ing. Mateo Silveira</span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      96% Match
                    </span>
                  </div>
                  <p className="text-[11px] text-outline">
                    Afinidad destacada para Arquitecto de Soluciones Cloud e IA
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('reclutamiento')}
                className="text-xs font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 self-end sm:self-center"
              >
                Revisar ficha &rarr;
              </button>
            </div>
          </div>

          {/* 9-Box Talent Distribution Widget */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                </span>
                <div>
                  <h2 className="text-sm font-extrabold text-on-surface">
                    Distribución de Desempeño y Potencial (9-Box)
                  </h2>
                  <p className="text-[11px] text-outline">
                    Clasificación de 142 colaboradores evaluados en el ciclo anual
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('evaluacion-desempeno')}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir Calibración 9-Box</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* 3 Main Talent Segments */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-1">
                    <span>Talento Destacado</span>
                    <span className="text-primary font-black">28%</span>
                  </div>
                  <p className="text-[11px] text-outline leading-tight">
                    40 colaboradores en cuadro de reemplazo y alto potencial.
                  </p>
                </div>
                <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[28%]" />
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-1">
                    <span>Desempeño Sólido</span>
                    <span className="text-emerald-600 font-black">42%</span>
                  </div>
                  <p className="text-[11px] text-outline leading-tight">
                    60 colaboradores con entrega constante y cumplimiento.
                  </p>
                </div>
                <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[42%]" />
                </div>
              </div>

              <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface mb-1">
                    <span>En Desarrollo</span>
                    <span className="text-amber-600 font-black">30%</span>
                  </div>
                  <p className="text-[11px] text-outline leading-tight">
                    42 colaboradores con planes de capacitación asignados.
                  </p>
                </div>
                <div className="mt-3 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[30%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: HR Action Center & Quick Operations (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Priority Action Center */}
          <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">notifications_active</span>
                </span>
                <h3 className="text-xs font-black uppercase tracking-wide text-on-surface">
                  Alertas Prioritarias
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                3 pendientes
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Alert 1 */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    SPOF &bull; Continuidad
                  </span>
                  <span className="text-[10px] text-outline">Operaciones</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  Área de Logística y Servidores necesita sucesor para Arquitectura Resiliente.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('value-map')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Revisar Cadena de Valor</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 2 */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Candidato Destacado
                  </span>
                  <span className="text-[10px] text-outline">Selección</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  Mateo Silveira completó todas las evaluaciones técnicas con 96% de afinidad.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('reclutamiento')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Avanzar a Oferta</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 3 */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20 hover:border-outline-variant/40 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Capacitación
                  </span>
                  <span className="text-[10px] text-outline">Upskilling</span>
                </div>
                <p className="text-on-surface font-semibold leading-snug">
                  Ing. Lucas Valenzuela alcanzó un 88% de avance en Gestión de Costos Cloud.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('capacitacion-upskilling')}
                  className="text-primary font-bold mt-2 hover:underline text-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver seguimiento de cursos</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>

          {/* HR Fast Actions Card */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-wide text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-base">bolt</span>
              Acciones Frecuentes
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('reclutamiento')}
                className="p-2.5 bg-surface-container-low hover:bg-surface-container text-left rounded-xl border border-outline-variant/30 transition-all cursor-pointer font-bold text-on-surface flex flex-col gap-1"
              >
                <span className="material-symbols-outlined text-primary text-lg">person_add</span>
                <span>Nueva Vacante</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('evaluacion-desempeno')}
                className="p-2.5 bg-surface-container-low hover:bg-surface-container text-left rounded-xl border border-outline-variant/30 transition-all cursor-pointer font-bold text-on-surface flex flex-col gap-1"
              >
                <span className="material-symbols-outlined text-emerald-600 text-lg">fact_check</span>
                <span>Calibrar 9-Box</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('puestos')}
                className="p-2.5 bg-surface-container-low hover:bg-surface-container text-left rounded-xl border border-outline-variant/30 transition-all cursor-pointer font-bold text-on-surface flex flex-col gap-1"
              >
                <span className="material-symbols-outlined text-indigo-600 text-lg">work</span>
                <span>Catálogo Puestos</span>
              </button>

              <button
                type="button"
                onClick={() => handleExport('xlsx')}
                className="p-2.5 bg-surface-container-low hover:bg-surface-container text-left rounded-xl border border-outline-variant/30 transition-all cursor-pointer font-bold text-on-surface flex flex-col gap-1"
              >
                <span className="material-symbols-outlined text-blue-600 text-lg">download</span>
                <span>Exportar Datos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Module Catalog: All 8 Functional Cards Maintained & Optimized */}
      <div className="mt-2 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pb-1">
          <div>
            <h2 className="text-base font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">apps</span>
              Módulos del Sistema y Catálogo Operativo
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Acceso directo a las herramientas y registros del ciclo de vida del personal.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
            8 Módulos Disponibles
          </span>
        </div>

        {/* Responsive 4-Column Grid for the 8 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Talento */}
          <div
            onClick={() => onNavigate('talent-map')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">hub</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-outline">
                  142 colaboradores
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                1. Talento y Competencias
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Conexión visual interactiva entre colaboradores, habilidades y criticidad operativa.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 2: Cadena de Valor */}
          <div
            onClick={() => onNavigate('value-map')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">schema</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-outline">
                  9 actividades Porter
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                2. Cadena de Valor
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Eslabones primarios y de apoyo, cobertura funcional y simulación de dotación.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 3: Puestos */}
          <div
            onClick={() => onNavigate('puestos')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">work</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-outline">
                  14 puestos
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                3. Puestos y Perfiles
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Catálogo oficial normalizado según el manual descriptivo de puestos de trabajo.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 4: Colaboradores */}
          <div
            onClick={() => onNavigate('empleados')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">group</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-outline">
                  Directorio activo
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                4. Colaboradores
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Directorio de personal, legajos individuales, dependencia jerárquica y fichas 360°.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 5: Selección */}
          <div
            onClick={() => onNavigate('reclutamiento')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">person_search</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  12 candidatos
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                5. Selección de Personal
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Vacantes abiertas, postulantes, habilidades y matching relacional ponderado.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 6: Evaluación */}
          <div
            onClick={() => onNavigate('evaluacion-desempeno')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">fact_check</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Calibración Q4
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                6. Evaluación de Desempeño
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Matriz 9-Box de potencial vs desempeño y acuerdos de comités de calibración.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 7: Capacitación */}
          <div
            onClick={() => onNavigate('capacitacion-upskilling')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">trending_up</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-outline">
                  4 rutas activas
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                7. Cursos y Capacitación
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Planes formativos para cerrar brechas técnicas y registrar el avance del personal.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>

          {/* Card 8: Reportes */}
          <div
            onClick={() => onNavigate('reportes-metricas')}
            className="p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-2xl border border-outline-variant/30 hover:border-primary/40 transition-all cursor-pointer group shadow-2xs hover:shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">query_stats</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  PDF &bull; Excel
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-on-surface group-hover:text-primary transition-colors">
                8. Informes y Fichas
              </h3>
              <p className="text-[11px] text-outline mt-1 leading-snug line-clamp-2">
                Exportación de manual de puestos, actas de evaluación y resúmenes ejecutivos.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-outline-variant/15 flex items-center justify-between text-xs text-primary font-bold">
              <span>Ingresar</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
