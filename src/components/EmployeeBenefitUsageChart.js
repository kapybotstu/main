import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const EmployeeBenefitUsageChart = ({ userData = [], benefitRequests = [] }) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'bar',
      backgroundColor: 'transparent',
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      height: 400,
      spacing: [20, 20, 20, 20]
    },
    title: {
      text: 'Uso de Beneficios Jobby por Empleado',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: [],
      title: {
        text: 'Empleados'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Beneficios Jobby Solicitados/Utilizados'
      }
    },
    tooltip: {
      formatter: function() {
        return `<b>${this.x}</b><br/>
                Beneficios Jobby solicitados: <b>${this.point.y}</b><br/>
                Aprobados: <b>${this.point.approved || 0}</b><br/>
                Utilizados: <b>${this.point.used || 0}</b>`;
      }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        },
        colorByPoint: false,
        colors: ['#3498db']
      }
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          chart: {
            height: 300
          },
          xAxis: {
            title: {
              text: null
            }
          },
          yAxis: {
            title: {
              text: 'Beneficios'
            }
          }
        }
      }]
    },
    series: [{
      name: 'Beneficios Jobby',
      data: []
    }]
  });

  useEffect(() => {
    if (userData.length === 0 || benefitRequests.length === 0) return;

    // Preparar datos para el gráfico
    const employeeData = userData.map(user => {
      // Filtrar solicitudes de este usuario que sean beneficios Jobby
      const userRequests = benefitRequests.filter(
        req => req.userId === user.id && req.isBenefitJobby
      );
      
      // Contar total, aprobados y utilizados
      const totalRequests = userRequests.length;
      const approvedRequests = userRequests.filter(req => req.status === 'approved').length;
      const usedRequests = userRequests.filter(req => req.status === 'used').length;
      
      return {
        name: user.displayName || user.email || 'Usuario sin nombre',
        y: totalRequests,
        approved: approvedRequests,
        used: usedRequests,
        userId: user.id
      };
    });
    
    // Filtrar solo usuarios que han solicitado al menos un beneficio
    const filteredData = employeeData
      .filter(item => item.y > 0)
      .sort((a, b) => b.y - a.y) // Ordenar por cantidad de beneficios solicitados
      .slice(0, 10); // Mostrar solo los 10 usuarios con más solicitudes
    
    // Actualizar opciones del gráfico
    setChartOptions(prevOptions => ({
      ...prevOptions,
      xAxis: {
        ...prevOptions.xAxis,
        categories: filteredData.map(item => item.name)
      },
      series: [{
        ...prevOptions.series[0],
        data: filteredData
      }]
    }));
  }, [userData, benefitRequests]);

  // Si no hay datos de beneficios Jobby, mostrar mensaje
  if (benefitRequests.filter(req => req.isBenefitJobby).length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Uso de Beneficios Jobby por Empleado</h3>
        <div className="no-data-message">
          <p>No hay datos suficientes para mostrar estadísticas.</p>
          <p>Los empleados de tu empresa aún no han solicitado beneficios Jobby.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
};

export default EmployeeBenefitUsageChart;