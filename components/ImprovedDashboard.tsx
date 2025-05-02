import React, { useState } from 'react';
import { DashboardProvider } from '../context/DashboardContext';
import { 
  Calendar, Briefcase, FileText
} from 'lucide-react';

const ImprovedDashboard: React.FC = () => {
  // Definir estado para aplicarlo si es necesario en el futuro
  const [activeSection, setActiveSection] = useState<string>('summary');
  
  return (
    <DashboardProvider>
      <div className="p-4 h-full">
        {/* Dashboard header with metrics section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-5 bg-white rounded-xl shadow-md flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Total Benefits Budget</h3>
            <div className="text-2xl font-bold text-jobby-purple">$8,000</div>
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-medium text-green-600">65%</span> Available
            </div>
            <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-jobby-purple" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div className="p-5 bg-white rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefits Used</h3>
            <div className="text-2xl font-bold text-jobby-gold">$2,800</div>
            <div className="mt-3 text-sm text-gray-600">
              Last transaction on <span className="font-medium">July 15, 2025</span>
            </div>
          </div>
          
          <div className="p-5 bg-white rounded-xl shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Events</h3>
            <div className="text-2xl font-bold text-jobby-purple">2</div>
            <div className="mt-3 text-sm text-gray-600">
              Next: <span className="font-medium">Wellbeing Day - July 25</span>
            </div>
          </div>
        </div>
        
        {/* The main dashboard with proper widgets */}
        <div className="widget-dashboard-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow-md p-5 h-full">
                <h3 className="text-lg font-semibold text-jobby-gray-800 mb-4">My Benefits</h3>
                <div className="space-y-4">
                  <div className="p-3 border border-jobby-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-2">
                          <Briefcase size={18} />
                        </div>
                        <span className="font-medium text-jobby-gray-800">Health</span>
                      </div>
                      <span className="text-sm">$1,200 / $2,000</span>
                    </div>
                    <div className="w-full h-1.5 bg-jobby-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-jobby-purple" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-jobby-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-2">
                          <FileText size={18} />
                        </div>
                        <span className="font-medium text-jobby-gray-800">Food</span>
                      </div>
                      <span className="text-sm">$800 / $1,500</span>
                    </div>
                    <div className="w-full h-1.5 bg-jobby-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-jobby-purple" style={{ width: '53%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-3 border border-jobby-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="p-2 rounded-md bg-jobby-purple/10 text-jobby-purple mr-2">
                          <FileText size={18} />
                        </div>
                        <span className="font-medium text-jobby-gray-800">Education</span>
                      </div>
                      <span className="text-sm">$300 / $1,000</span>
                    </div>
                    <div className="w-full h-1.5 bg-jobby-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-jobby-purple" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="bg-white rounded-xl shadow-md p-5 h-full">
                <div className="flex items-center mb-4">
                  <div className="p-2 rounded-md bg-jobby-gold/10 text-jobby-gold mr-3">
                    <Calendar size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-jobby-gray-800">Upcoming Events</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple/50 transition-all">
                    <h4 className="font-medium text-jobby-gray-800">Wellbeing Day - Yoga</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-jobby-gray-600">July 25, 2025 - 10:00 AM</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Wellness
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg border border-jobby-gray-200 hover:border-jobby-purple/50 transition-all">
                    <h4 className="font-medium text-jobby-gray-800">Personal Finance Webinar</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-jobby-gray-600">July 28, 2025 - 4:00 PM</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        Education
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardProvider>
  );
};

export default ImprovedDashboard;