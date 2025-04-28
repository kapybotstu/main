import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, BarChart, User } from 'lucide-react';

interface EmployeeSkills {
  leadership: number;
  technical: number;
  communication: number;
  teamwork: number;
  problemSolving: number;
  creativity: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  stats: {
    tasks: number;
    completed: number;
    pending: number;
  };
  skills: EmployeeSkills;
  color: string;
}

interface StatsWidgetProps {
  data: {
    icon: any;
    stats: Array<{
      label: string;
      value: number;
      color: string;
    }>;
  };
}

// Component for the hexagonal skills chart
const HexagonalChart: React.FC<{ 
  skills: EmployeeSkills; 
  color: string;
  maxValue?: number;
}> = ({ skills, color, maxValue = 10 }) => {
  // Chart dimensions
  const size = 200;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  // The six skills to display
  const skillKeys: (keyof EmployeeSkills)[] = [
    'leadership', 
    'technical', 
    'communication', 
    'teamwork', 
    'problemSolving', 
    'creativity'
  ];
  
  // Calculate positions for each axis
  const getPosition = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / skillKeys.length - Math.PI / 2;
    const ratio = value / maxValue;
    return {
      x: centerX + radius * ratio * Math.cos(angle),
      y: centerY + radius * ratio * Math.sin(angle)
    };
  };
  
  // Calculate positions for the hexagon points
  const points = skillKeys.map((skill, index) => {
    const pos = getPosition(index, skills[skill]);
    return `${pos.x},${pos.y}`;
  }).join(' ');
  
  // Calculate positions for the axis endpoints
  const axisEndpoints = skillKeys.map((_, index) => {
    const pos = getPosition(index, maxValue);
    return pos;
  });
  
  // Format color for fill (using color with transparency)
  const fillColor = color.replace('bg-', 'fill-').replace('-500', '-300/40');
  const strokeColor = color.replace('bg-', 'stroke-');
  
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mb-2">
        {/* Background grid (multiple hexagons) */}
        {[2, 4, 6, 8, 10].map((level) => (
          <polygon 
            key={level}
            points={skillKeys.map((_, index) => {
              const pos = getPosition(index, level);
              return `${pos.x},${pos.y}`;
            }).join(' ')}
            fill="none"
            stroke="rgba(209, 213, 219, 0.5)"
            strokeWidth="1"
          />
        ))}
        
        {/* Axes */}
        {axisEndpoints.map((endpoint, index) => (
          <line 
            key={index}
            x1={centerX}
            y1={centerY}
            x2={endpoint.x}
            y2={endpoint.y}
            stroke="rgba(209, 213, 219, 0.8)"
            strokeWidth="1"
          />
        ))}
        
        {/* Data polygon */}
        <polygon 
          points={points}
          className={`${fillColor} ${strokeColor}`}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {skillKeys.map((skill, index) => {
          const pos = getPosition(index, skills[skill]);
          return (
            <circle 
              key={index}
              cx={pos.x}
              cy={pos.y}
              r="3"
              className={color.replace('bg-', 'fill-')}
            />
          );
        })}
      </svg>
      
              {/* Skill labels */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {skillKeys.map((skill) => (
          <div key={skill} className="flex items-center justify-between">
            <span className="text-xs text-gray-700 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
            <div className="flex items-center">
              <div className={`w-12 h-2 bg-gray-100 rounded-full overflow-hidden mr-2`}>
                <div 
                  className={color}
                  style={{ width: `${(skills[skill] / maxValue) * 100}%`, height: '100%' }}
                />
              </div>
              <span className="text-xs font-medium">{skills[skill]}/10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsWidget: React.FC<StatsWidgetProps> = ({ data }) => {
  // We use the icon in the header display
  const HeaderIcon = data.icon;
  
  // Sample employee data with skills for the hexagonal chart
  const employees: Employee[] = [
    {
      id: "emp1",
      name: "Alex Johnson",
      role: "Software Developer",
      department: "Engineering",
      stats: {
        tasks: 24,
        completed: 18,
        pending: 6
      },
      skills: {
        leadership: 5,
        technical: 9,
        communication: 7,
        teamwork: 8,
        problemSolving: 9,
        creativity: 7
      },
      color: "bg-purple-500"
    },
    {
      id: "emp2",
      name: "Maria Garcia",
      role: "UX Designer",
      department: "Design",
      stats: {
        tasks: 18,
        completed: 15,
        pending: 3
      },
      skills: {
        leadership: 6,
        technical: 7,
        communication: 8,
        teamwork: 7,
        problemSolving: 8,
        creativity: 10
      },
      color: "bg-yellow-500"
    },
    {
      id: "emp3",
      name: "James Smith",
      role: "Project Manager",
      department: "Management",
      stats: {
        tasks: 32,
        completed: 24,
        pending: 8
      },
      skills: {
        leadership: 10,
        technical: 6,
        communication: 9,
        teamwork: 9,
        problemSolving: 8,
        creativity: 7
      },
      color: "bg-green-500"
    },
    {
      id: "emp4",
      name: "Sarah Williams",
      role: "Marketing Specialist",
      department: "Marketing",
      stats: {
        tasks: 15,
        completed: 10,
        pending: 5
      },
      skills: {
        leadership: 7,
        technical: 5,
        communication: 10,
        teamwork: 8,
        problemSolving: 7,
        creativity: 9
      },
      color: "bg-blue-500"
    }
  ];

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };
  
  const handleBackClick = () => {
    setSelectedEmployee(null);
  };
  
  const renderEmployeeList = () => {
    return (
      <div className="space-y-3">
        {employees.map((employee) => (
          <motion.div
            key={employee.id}
            className="p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => handleEmployeeClick(employee)}
          >
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full ${employee.color} flex items-center justify-center text-white font-medium`}>
                {employee.name.split(' ').map(part => part[0]).join('')}
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-jobby-gray-800">{employee.name}</h4>
                <p className="text-xs text-jobby-gray-500">{employee.role} • {employee.department}</p>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center text-sm">
              <span className="text-jobby-gray-600">
                {employee.stats.completed} / {employee.stats.tasks} tasks
              </span>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={employee.color}
                  style={{ width: `${(employee.stats.completed / employee.stats.tasks) * 100}%`, height: '100%' }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };
  
  const renderEmployeeHexChart = () => {
    if (!selectedEmployee) return null;
    
    const completionPercentage = Math.round((selectedEmployee.stats.completed / selectedEmployee.stats.tasks) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-5"
      >
        <button 
          onClick={handleBackClick}
          className="flex items-center text-jobby-purple hover:underline text-sm"
        >
          <ChevronLeft size={16} className="mr-1" />
          Back to employee list
        </button>
        
        <div className="flex flex-col items-center">
          <div className={`h-16 w-16 rounded-full ${selectedEmployee.color} flex items-center justify-center text-white text-xl font-medium mb-2`}>
            {selectedEmployee.name.split(' ').map(part => part[0]).join('')}
          </div>
          <h3 className="text-lg font-semibold text-jobby-gray-800">{selectedEmployee.name}</h3>
          <p className="text-sm text-jobby-gray-600">{selectedEmployee.role} • {selectedEmployee.department}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-jobby-gray-200">
          <h4 className="font-medium text-jobby-gray-700 mb-4 text-center">Skills Assessment</h4>
          
          <HexagonalChart 
            skills={selectedEmployee.skills} 
            color={selectedEmployee.color}
          />
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-jobby-gray-200">
          <h4 className="font-medium text-jobby-gray-700 mb-3 flex items-center">
            <BarChart size={18} className="mr-2" /> Task Performance
          </h4>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-jobby-gray-600">Completion Rate</span>
            <span className="text-sm font-medium">{completionPercentage}%</span>
          </div>
          
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div 
              className={selectedEmployee.color}
              style={{ width: `${completionPercentage}%`, height: '100%' }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-jobby-gray-600">Total</p>
              <p className="text-lg font-semibold text-jobby-gray-800">{selectedEmployee.stats.tasks}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-jobby-gray-600">Completed</p>
              <p className="text-lg font-semibold text-green-600">{selectedEmployee.stats.completed}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-jobby-gray-600">Pending</p>
              <p className="text-lg font-semibold text-amber-600">{selectedEmployee.stats.pending}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-3">
          {selectedEmployee ? <User size={20} /> : <HeaderIcon size={20} />}
        </div>
        <span className="text-sm text-jobby-gray-600">
          {selectedEmployee ? 'Employee Profile' : 'Team Overview'}
        </span>
      </div>
      
      <AnimatePresence mode="wait">
        {selectedEmployee ? renderEmployeeHexChart() : renderEmployeeList()}
      </AnimatePresence>
    </div>
  );
};

export default StatsWidget;