import {
  EmployeeProfile,
  JobPosition,
  Candidate,
  PorterActivity,
  TalentPerson,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Almacenamiento local del token de autenticación
const TOKEN_KEY = 'nexus_auth_token';
const USER_KEY = 'nexus_auth_user';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

// Utilidad para descargar archivos Blob (Excel, CSV, JSON) en el navegador
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Wrapper tipado para solicitudes HTTP fetch
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      // Usar error predeterminado
    }
    throw new Error(errorMsg);
  }

  // Si la respuesta es un archivo descargable (Excel, CSV, PDF, JSON exportado)
  const contentDisposition = response.headers.get('content-disposition') || '';
  const contentType = response.headers.get('content-type') || '';
  if (
    contentDisposition.includes('attachment') ||
    contentType.includes('application/pdf') ||
    contentType.includes('application/vnd') ||
    contentType.includes('text/csv') ||
    contentType.includes('application/octet-stream')
  ) {
    return (await response.blob()) as unknown as T;
  }

  return response.json();
}

// 1. Módulo de Autenticación
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await request<{
      access_token: string;
      user: {
        id: string;
        email: string;
        name: string;
        role: string;
        employeeId?: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    tokenStorage.set(data.access_token);
    tokenStorage.setUser(data.user);
    return data;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    employeeId?: string;
  }) => {
    return request<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return request<{
      id: string;
      email: string;
      name: string;
      role: string;
      employeeId?: string;
    }>('/auth/me');
  },

  logout: () => {
    tokenStorage.remove();
  },
};

// 2. Módulo de Colaboradores y Talento
export const employeesApi = {
  getAll: async (params?: { area?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.area) query.append('area', params.area);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<{ total: number; data: EmployeeProfile[] }>(`/employees${qs ? `?${qs}` : ''}`);
  },

  getById: async (id: string) => {
    return request<EmployeeProfile>(`/employees/${id}`);
  },

  getTalentPersons: async (params?: { domain?: string; risk?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.domain) query.append('domain', params.domain);
    if (params?.risk) query.append('risk', params.risk);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<{ total: number; data: TalentPerson[] }>(`/employees/talent/persons${qs ? `?${qs}` : ''}`);
  },

  create: async (employeeData: Partial<EmployeeProfile>) => {
    return request<EmployeeProfile>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id: string, updateData: Partial<EmployeeProfile>) => {
    return request<EmployeeProfile>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  downloadPdf: async (id: string, employeeName?: string) => {
    const blob = await request<Blob>(`/employees/${id}/pdf`);
    const cleanName = employeeName ? employeeName.replace(/\s+/g, '_') : id;
    downloadFile(blob, `Ficha_Colaborador_${cleanName}_${Date.now()}.pdf`);
  },
};

// 3. Módulo de Puestos (DPT)
export const jobsApi = {
  getAll: async (params?: { department?: string; onlyCritical?: boolean; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.department) query.append('department', params.department);
    if (params?.onlyCritical) query.append('onlyCritical', 'true');
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return request<{ total: number; data: JobPosition[] }>(`/jobs${qs ? `?${qs}` : ''}`);
  },

  getByCode: async (code: string) => {
    return request<JobPosition>(`/jobs/${code}`);
  },

  create: async (jobData: any) => {
    return request<JobPosition>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  openVacancy: async (code: string) => {
    return request<any>(`/jobs/${code}/open-vacancy`, {
      method: 'POST',
    });
  },

  downloadMatrix: async (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    const blob = await request<Blob>(`/jobs/export?format=${format}`);
    downloadFile(blob, `Matriz_Puestos_NEXUS_${Date.now()}.${format}`);
  },
};

// 4. Módulo de Reclutamiento y Selección
export const recruitmentApi = {
  getCandidates: async (params?: { jobCode?: string; minMatch?: number }) => {
    const query = new URLSearchParams();
    if (params?.jobCode) query.append('jobCode', params.jobCode);
    if (params?.minMatch) query.append('minMatch', params.minMatch.toString());
    const qs = query.toString();
    return request<{ total: number; data: Array<Candidate & { stage?: string }> }>(
      `/recruitment/candidates${qs ? `?${qs}` : ''}`,
    );
  },

  getCandidateById: async (id: string) => {
    return request<Candidate & { stage?: string }>(`/recruitment/candidates/${id}`);
  },

  updateStage: async (id: string, stage: string) => {
    return request<{ message: string; candidate: Candidate }>(`/recruitment/candidates/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  sendOffer: async (id: string, offerDetails?: { salary?: string; startDate?: string }) => {
    return request<any>(`/recruitment/candidates/${id}/offer`, {
      method: 'POST',
      body: JSON.stringify(offerDetails || {}),
    });
  },
};

// 5. Módulo de Evaluación de Desempeño y Matriz 9-Box
export const evaluationsApi = {
  getAll: async (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return request<{ total: number; data: any[] }>(`/evaluations${qs}`);
  },

  get9Box: async () => {
    return request<{
      cycle: string;
      totalEvaluated: number;
      distribution: Record<string, any[]>;
      evaluations: any[];
    }>('/evaluations/9box');
  },

  calibrate: async (id: string, data: { calibratedScore: number; box9: string; notes?: string }) => {
    return request<{ message: string; evaluation: any }>(`/evaluations/${id}/calibrate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  download9Box: async (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    const blob = await request<Blob>(`/evaluations/export?format=${format}`);
    downloadFile(blob, `Acta_9Box_Calibracion_NEXUS_${Date.now()}.${format}`);
  },
};

// 6. Módulo de Capacitación y Upskilling
export const trainingApi = {
  getAll: async (params?: { category?: string }) => {
    const qs = params?.category ? `?category=${params.category}` : '';
    return request<{ total: number; data: any[] }>(`/training/tracks${qs}`);
  },

  getById: async (id: string) => {
    return request<any>(`/training/tracks/${id}`);
  },

  enroll: async (trackId: string, employeeName: string) => {
    return request<{ message: string; track: any }>('/training/enroll', {
      method: 'POST',
      body: JSON.stringify({ trackId, employeeName }),
    });
  },
};

// 7. Módulo de Cadena de Valor (Porter)
export const porterApi = {
  getAll: async () => {
    return request<{ total: number; data: PorterActivity[] }>('/porter/activities');
  },

  getById: async (id: number) => {
    return request<PorterActivity>(`/porter/activities/${id}`);
  },

  simulate: async (activityId: number, headcount: number, budgetK: number) => {
    return request<any>('/porter/simulate', {
      method: 'POST',
      body: JSON.stringify({ activityId, headcount, budgetK }),
    });
  },
};

// 8. Módulo de Reportes Ejecutivos
export const reportsApi = {
  getDashboardKpis: async (quarter: string = 'Q4 2026') => {
    return request<any>(`/reports/dashboard-kpis?quarter=${encodeURIComponent(quarter)}`);
  },

  getSquadsHeatmap: async () => {
    return request<{ totalSquads: number; data: any[] }>('/reports/squads-heatmap');
  },

  getSkillsInventory: async () => {
    return request<{ totalCompetencies: number; data: any[] }>('/reports/skills-inventory');
  },

  downloadReport: async (format: 'xlsx' | 'csv' | 'pdf' = 'xlsx') => {
    const blob = await request<Blob>(`/reports/export?format=${format}`);
    downloadFile(blob, `Reporte_Consolidado_NEXUS_${Date.now()}.${format}`);
  },

  downloadSkillsJson: async () => {
    const blob = await request<Blob>('/reports/export/skills-json');
    downloadFile(blob, `Inventario_Competencias_NEXUS_${Date.now()}.json`);
  },
};
