import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Definir interfaces para los tipos de datos
interface DepartmentData {
  name: string;
  salud: number;
  alimentacion: number;
  educacion: number;
  entretenimiento: number;
  total: number;
  [key: string]: string | number; // Permite indexación con strings
}

interface CategoryData {
  name: string;
  valor: number;
  color: string;
}

const DepartmentReportWidget: React.FC = () => {
  // Sample data for departments
  const departmentData: DepartmentData[] = [
    {
      name: 'Marketing',
      salud: 4200,
      alimentacion: 3100,
      educacion: 2800,
      entretenimiento: 1200,
      total: 11300
    },
    {
      name: 'Ventas',
      salud: 3800,
      alimentacion: 4500,
      educacion: 1500,
      entretenimiento: 2300,
      total: 12100
    },
    {
      name: 'Desarrollo',
      salud: 5500,
      alimentacion: 3800,
      educacion: 4200,
      entretenimiento: 1700,
      total: 15200
    },
    {
      name: 'RRHH',
      salud: 3200,
      alimentacion: 2900,
      educacion: 3600,
      entretenimiento: 900,
      total: 10600
    },
    {
      name: 'Finanzas',
      salud: 2800,
      alimentacion: 2500,
      educacion: 3100,
      entretenimiento: 800,
      total: 9200
    }
  ];

  const [activeTab, setActiveTab] = useState<'departamentos' | 'categorias'>('departamentos');
  const [selectedFilter, setSelectedFilter] = useState<'total' | 'salud' | 'alimentacion' | 'educacion' | 'entretenimiento'>('total');
  
  // Sort departments by selected metric
  const sortedData = [...departmentData].sort((a, b) => b[selectedFilter] - a[selectedFilter]);

  // Calcular datos para la vista de categorías
  const categoriesData: CategoryData[] = [
    { 
      name: 'Salud', 
      valor: departmentData.reduce((sum, dept) => sum + dept.salud, 0), 
      color: '#6366F1' 
    },
    { 
      name: 'Alimentación', 
      valor: departmentData.reduce((sum, dept) => sum + dept.alimentacion, 0), 
      color: '#F59E0B' 
    },
    { 
      name: 'Educación', 
      valor: departmentData.reduce((sum, dept) => sum + dept.educacion, 0), 
      color: '#10B981' 
    },
    { 
      name: 'Entretenimiento', 
      valor: departmentData.reduce((sum, dept) => sum + dept.entretenimiento, 0), 
      color: '#EC4899' 
    }
  ];

  // Encontrar la categoría con mayor valor
  const totalBenefits = categoriesData.reduce((sum, cat) => sum + cat.valor, 0);
  const maxCategory = categoriesData.reduce((max, current) => 
    max.valor > current.valor ? max : current, categoriesData[0]);
  const maxPercentage = Math.round((maxCategory.valor / totalBenefits) * 100);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Uso de Beneficios por Departamento</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('departamentos')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeTab === 'departamentos' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Departamentos
          </button>
          <button
            onClick={() => setActiveTab('categorias')}
            className={`px-3 py-1 text-sm rounded-md ${
              activeTab === 'categorias' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Categorías
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por:</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedFilter('total')}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedFilter === 'total' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Total
          </button>
          <button
            onClick={() => setSelectedFilter('salud')}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedFilter === 'salud' 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Salud
          </button>
          <button
            onClick={() => setSelectedFilter('alimentacion')}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedFilter === 'alimentacion' 
                ? 'bg-amber-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alimentación
          </button>
          <button
            onClick={() => setSelectedFilter('educacion')}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedFilter === 'educacion' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Educación
          </button>
          <button
            onClick={() => setSelectedFilter('entretenimiento')}
            className={`px-3 py-1 text-xs rounded-full ${
              selectedFilter === 'entretenimiento' 
                ? 'bg-pink-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Entretenimiento
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {activeTab === 'departamentos' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip 
                formatter={(value: number) => [`$${value}`, '']}
                contentStyle={{ borderRadius: '6px' }}
              />
              <Legend />
              <Bar dataKey="salud" name="Salud" fill="#6366F1" radius={[0, 4, 4, 0]} />
              <Bar dataKey="alimentacion" name="Alimentación" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              <Bar dataKey="educacion" name="Educación" fill="#10B981" radius={[0, 4, 4, 0]} />
              <Bar dataKey="entretenimiento" name="Entretenimiento" fill="#EC4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoriesData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`$${value}`, 'Total']}
                contentStyle={{ borderRadius: '6px' }}
              />
              <Bar dataKey="valor" name="Total">
                {categoriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Resumen</h3>
          <p className="text-sm text-gray-600">
            {activeTab === 'departamentos' 
              ? `El departamento con mayor uso de beneficios es ${sortedData[0].name} con $${sortedData[0].total} en total.`
              : `La categoría más utilizada es la de ${maxCategory.name} representando el ${maxPercentage}% del total.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepartmentReportWidget;