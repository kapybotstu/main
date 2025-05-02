import React, { useState } from 'react';
import { Download, FileText, Filter, ChevronDown, Calendar, Check } from 'lucide-react';

// Definir las interfaces necesarias
interface ReportType {
  id: string;
  name: string;
  description: string;
}

interface DateRange {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface GeneratedReport {
  name: string;
  date: string;
  type: string;
  format: string;
}

const ReportGeneratorWidget: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>('usage');
  const [showReportMenu, setShowReportMenu] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<string>('month');
  const [showDateMenu, setShowDateMenu] = useState<boolean>(false);
  const [departments, setDepartments] = useState<string[]>(['marketing', 'desarrollo', 'ventas', 'rrhh']);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [lastGeneratedReport, setLastGeneratedReport] = useState<GeneratedReport | null>(null);
  
  const reportTypes: ReportType[] = [
    { id: 'usage', name: 'Uso de Beneficios', description: 'Análisis detallado de la utilización de beneficios' },
    { id: 'budget', name: 'Presupuesto y Gastos', description: 'Informes de presupuesto y gastos por categoría' },
    { id: 'satisfaction', name: 'Satisfacción', description: 'Nivel de satisfacción de los empleados' },
    { id: 'roi', name: 'ROI de Beneficios', description: 'Análisis de retorno de inversión' },
  ];
  
  const dateRanges: DateRange[] = [
    { id: 'week', name: 'Última Semana' },
    { id: 'month', name: 'Último Mes' },
    { id: 'quarter', name: 'Último Trimestre' },
    { id: 'year', name: 'Último Año' },
    { id: 'custom', name: 'Personalizado' }
  ];
  
  const departmentOptions: Department[] = [
    { id: 'marketing', name: 'Marketing' },
    { id: 'desarrollo', name: 'Desarrollo' },
    { id: 'ventas', name: 'Ventas' },
    { id: 'rrhh', name: 'Recursos Humanos' },
    { id: 'finanzas', name: 'Finanzas' },
    { id: 'operaciones', name: 'Operaciones' }
  ];
  
  const toggleDepartment = (deptId: string): void => {
    if (departments.includes(deptId)) {
      setDepartments(departments.filter(id => id !== deptId));
    } else {
      setDepartments([...departments, deptId]);
    }
  };
  
  const handleGenerateReport = (): void => {
    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      const now = new Date();
      const selectedReport = reportTypes.find(r => r.id === selectedReportType);
      if (selectedReport) {
        setLastGeneratedReport({
          name: `${selectedReport.name} - ${now.toLocaleDateString()}`,
          date: now.toISOString(),
          type: selectedReportType,
          format: 'xlsx'
        });
      }
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Generador de Reportes</h2>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-900"
        >
          <Filter size={16} />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Report Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Reporte
          </label>
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => setShowReportMenu(!showReportMenu)}
            >
              <span>{reportTypes.find(r => r.id === selectedReportType)?.name}</span>
              <ChevronDown size={16} className={`transition-transform ${showReportMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showReportMenu && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {reportTypes.map(report => (
                  <div
                    key={report.id}
                    className={`px-4 py-2 hover:bg-purple-50 cursor-pointer ${selectedReportType === report.id ? 'bg-purple-50' : ''}`}
                    onClick={() => {
                      setSelectedReportType(report.id);
                      setShowReportMenu(false);
                    }}
                  >
                    <div className="font-medium">{report.name}</div>
                    <div className="text-xs text-gray-500">{report.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Date Range Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Periodo de Tiempo
          </label>
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={() => setShowDateMenu(!showDateMenu)}
            >
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span>{dateRanges.find(d => d.id === dateRange)?.name}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showDateMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showDateMenu && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                {dateRanges.map(range => (
                  <div
                    key={range.id}
                    className={`px-4 py-2 hover:bg-purple-50 cursor-pointer ${dateRange === range.id ? 'bg-purple-50' : ''}`}
                    onClick={() => {
                      setDateRange(range.id);
                      setShowDateMenu(false);
                    }}
                  >
                    {range.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Department Filters (optional) */}
        {showFilters && (
          <div className="animate-fadeIn bg-gray-50 p-3 rounded-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamentos
            </label>
            <div className="grid grid-cols-2 gap-2">
              {departmentOptions.map(dept => (
                <div key={dept.id} className="flex items-center">
                  <button
                    type="button"
                    className={`flex items-center justify-center h-5 w-5 rounded ${
                      departments.includes(dept.id) 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-white border border-gray-300'
                    }`}
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    {departments.includes(dept.id) && <Check size={12} />}
                  </button>
                  <span className="ml-2 text-sm text-gray-700">{dept.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Generate Report Button */}
        <button
          type="button"
          className="w-full py-2 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center justify-center"
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Generando Reporte...
            </>
          ) : (
            <>
              <FileText size={16} className="mr-2" />
              Generar Reporte
            </>
          )}
        </button>
      </div>
      
      {/* Recent Reports */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Reportes Recientes</h3>
        
        <div className="space-y-2">
          {lastGeneratedReport && (
            <div className="p-3 border border-gray-200 rounded-md bg-white flex items-center justify-between hover:bg-gray-50">
              <div>
                <div className="font-medium text-sm">{lastGeneratedReport.name}</div>
                <div className="text-xs text-gray-500">
                  Generado: {new Date(lastGeneratedReport.date).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                className="p-1.5 rounded-md text-purple-700 hover:bg-purple-100"
              >
                <Download size={16} />
              </button>
            </div>
          )}
          
          <div className="p-3 border border-gray-200 rounded-md bg-white flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="font-medium text-sm">Reporte Trimestral - Q2 2025</div>
              <div className="text-xs text-gray-500">Generado: 15/06/2025 09:45</div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-md text-purple-700 hover:bg-purple-100"
            >
              <Download size={16} />
            </button>
          </div>
          
          <div className="p-3 border border-gray-200 rounded-md bg-white flex items-center justify-between hover:bg-gray-50">
            <div>
              <div className="font-medium text-sm">Resumen de Beneficios - Mayo 2025</div>
              <div className="text-xs text-gray-500">Generado: 02/06/2025 14:30</div>
            </div>
            <button
              type="button"
              className="p-1.5 rounded-md text-purple-700 hover:bg-purple-100"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneratorWidget;