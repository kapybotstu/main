import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, DatabaseReference } from 'firebase/database';
import { BarChart, LineChart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBeW7WkO-DXxzhiJWBxxRdOnWiaNCVLkCY",
  authDomain: "testdashborad-b9ec7.firebaseapp.com",
  databaseURL: "https://testdashborad-b9ec7-default-rtdb.firebaseio.com",
  projectId: "testdashborad-b9ec7",
  storageBucket: "testdashborad-b9ec7.firebasestorage.app",
  messagingSenderId: "417789973551",
  appId: "1:417789973551:web:7493ea076421266db722da"
};

// Generation mappings for displaying friendly names
const generationLabels: Record<string, string> = {
  'gen-x': 'Generación X',
  'gen-z': 'Generación Z',
  'millennial': 'Millennials',
  'boomer': 'Baby Boomers',
  'alpha': 'Generación Alpha'
};

// Generation color mappings for the chart
const generationColors: Record<string, string> = {
  'gen-x': 'bg-blue-500',
  'gen-z': 'bg-purple-500',
  'millennial': 'bg-green-500',
  'boomer': 'bg-yellow-500',
  'alpha': 'bg-pink-500'
};

interface GenerationData {
  [key: string]: number;
}

const ApplicationsWidget: React.FC = () => {
  const [generationData, setGenerationData] = useState<GenerationData>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [firebaseInitialized, setFirebaseInitialized] = useState<boolean>(false);
  const [databaseRef, setDatabaseRef] = useState<DatabaseReference | null>(null);

  // Initialize Firebase once, on component mount
  useEffect(() => {
    try {
      // Check if Firebase is already initialized
      let app;
      try {
        app = initializeApp(firebaseConfig);
      } catch (err) {
        // If already initialized, use a named app
        const error = err as Error;
        if (error.message && error.message.includes('already exists')) {
          app = initializeApp(firebaseConfig, 'survey-widget-app');
        } else {
          throw err;
        }
      }
      
      const database = getDatabase(app);
      const surveyResponsesRef = ref(database, 'surveyResponses');
      setDatabaseRef(surveyResponsesRef);
      setFirebaseInitialized(true);
    } catch (err) {
      console.error('Error initializing Firebase:', err);
      setError('Error initializing the database connection. Please try refreshing the page.');
      setIsLoading(false);
    }
  }, []);

  // Fetch data once Firebase is initialized
  useEffect(() => {
    if (firebaseInitialized && databaseRef) {
      fetchSurveyData();
      
      // Set up refresh interval
      const intervalId = setInterval(fetchSurveyData, 60000); // Refresh every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [firebaseInitialized, databaseRef]);

  const fetchSurveyData = async () => {
    if (!databaseRef) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const snapshot = await get(databaseRef);
      
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        
        if (!rawData || typeof rawData !== 'object') {
          setGenerationData({});
          setTotalResponses(0);
          setIsLoading(false);
          return;
        }
        
        const generationCounts: GenerationData = {};
        let validResponsesCount = 0;
        
        // Process each survey response
        Object.entries(rawData).forEach(([key, value]) => {
          // Safely extract survey data
          const surveyData = value as any;
          
          if (
            surveyData && 
            typeof surveyData === 'object' && 
            surveyData.answers && 
            typeof surveyData.answers === 'object' &&
            surveyData.answers['2'] && 
            typeof surveyData.answers['2'] === 'string'
          ) {
            const generationValue = surveyData.answers['2'];
            validResponsesCount++;
            
            // Count each generation
            generationCounts[generationValue] = (generationCounts[generationValue] || 0) + 1;
          }
        });
        
        setGenerationData(generationCounts);
        setTotalResponses(validResponsesCount);
      } else {
        setGenerationData({});
        setTotalResponses(0);
      }
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setError('Error al cargar los datos. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate max value for scaling the chart
  const maxValue = Math.max(...Object.values(generationData).map(v => v || 0), 1);
  
  // Find the most common generation
  const findMostCommonGeneration = (): string => {
    let maxCount = 0;
    let mostCommon = '';
    
    Object.entries(generationData).forEach(([generation, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = generation;
      }
    });
    
    return mostCommon;
  };
  
  const mostCommonGeneration = findMostCommonGeneration();
  
  const renderChartData = () => {
    if (Object.keys(generationData).length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-500 mb-2">No hay datos de generación disponibles</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-4 mb-6">
          {Object.entries(generationData)
            .sort(([, countA], [, countB]) => (countB || 0) - (countA || 0)) // Sort by count descending
            .map(([generation, count]) => {
              // Skip if generation is null or undefined
              if (!generation) return null;
              
              // Safely calculate percentage
              const percentage = totalResponses > 0 
                ? Math.round(((count || 0) / totalResponses) * 100) 
                : 0;
              
              return (
                <div key={generation} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {generationLabels[generation] || generation}
                    </span>
                    <span className="text-gray-600">
                      {count || 0} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded overflow-hidden">
                    <motion.div 
                      className={`h-full ${generationColors[generation] || 'bg-indigo-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${((count || 0) / maxValue) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
        
        {mostCommonGeneration && (
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-700 mb-1">Generación predominante:</h4>
            <p className="text-indigo-800">
              {generationLabels[mostCommonGeneration] || mostCommonGeneration}
            </p>
          </div>
        )}
      </>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Distribución por Generación</h3>
          <p className="text-sm text-gray-500">{totalResponses} respuestas</p>
        </div>
        <button 
          onClick={fetchSurveyData}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Refresh data"
          disabled={isLoading || !firebaseInitialized}
        >
          <RefreshCw size={18} className={`text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <BarChart size={40} className="text-gray-300 mb-2" />
              <p className="text-gray-400">Cargando datos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button 
                onClick={fetchSurveyData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!firebaseInitialized}
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          renderChartData()
        )}
      </div>
      
      <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
        <div className="flex items-center">
          <LineChart size={16} className="text-gray-500 mr-2" />
          <span className="text-xs text-gray-500">
            Datos actualizados en tiempo real desde Firebase
          </span>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsWidget;