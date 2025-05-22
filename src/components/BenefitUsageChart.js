import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const BenefitUsageChart = ({ jobbyBenefitData = [], companyBenefitData = [] }) => {
  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'column',
      backgroundColor: 'transparent',
      style: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      height: 350,
      spacing: [20, 20, 20, 20]
    },
    title: {
      text: 'Uso de Beneficios',
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: ['Pendientes', 'Aprobados', 'Rechazados', 'Utilizados'],
      crosshair: true
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Cantidad'
      }
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                   '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0
      }
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
          legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    },
    series: [
      {
        name: 'Beneficios Jobby',
        color: '#3498db',
        data: [0, 0, 0, 0]
      },
      {
        name: 'Beneficios Empresa',
        color: '#2ecc71',
        data: [0, 0, 0, 0]
      }
    ],
    lang: {
      thousandsSep: ','
    }
  });

  useEffect(() => {
    // Transformar los datos para el gráfico
    const jobbyData = [
      jobbyBenefitData.filter(item => item.status === 'pending').length,
      jobbyBenefitData.filter(item => item.status === 'approved').length,
      jobbyBenefitData.filter(item => item.status === 'rejected').length,
      jobbyBenefitData.filter(item => item.status === 'used').length
    ];
    
    const companyData = [
      companyBenefitData.filter(item => item.status === 'pending').length,
      companyBenefitData.filter(item => item.status === 'approved').length,
      companyBenefitData.filter(item => item.status === 'rejected').length,
      companyBenefitData.filter(item => item.status === 'used').length
    ];
    
    setChartOptions(prevOptions => ({
      ...prevOptions,
      series: [
        {
          ...prevOptions.series[0],
          data: jobbyData
        },
        {
          ...prevOptions.series[1],
          data: companyData
        }
      ]
    }));
  }, [jobbyBenefitData, companyBenefitData]);

  return (
    <div className="chart-container">
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
};

export default BenefitUsageChart;