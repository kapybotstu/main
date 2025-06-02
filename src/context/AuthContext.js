import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, database } from '../services/firebase/config';
import { subscribeToAuthChanges } from '../services/firebase/auth/authService';
import { ref, get } from 'firebase/database';
import { getUserSurveyStatus } from '../services/firebase/database/databaseService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [surveyCompleted, setSurveyCompleted] = useState(null);

  useEffect(() => {
    console.log("AuthProvider initialized");
    
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user");
      
      if (user) {
        // Usuario autenticado, obtener datos adicionales
        try {
          console.log("Attempting to fetch user data for:", user.uid);
          const userRef = ref(database, `users/${user.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            console.log("User data fetched successfully:", userData);
            setUserLevel(userData.level);
            
            // Si es nivel 2 o 3, obtener companyId
            if (userData.level === 2 || userData.level === 3) {
              setCompanyId(userData.companyId);
              console.log("Company ID set:", userData.companyId);
            }
            
            // Si es nivel 3, verificar si completó la encuesta
            if (userData.level === 3) {
              try {
                // MODO DE PRUEBA: Siempre forzar encuesta para desarrollo
                const SURVEY_TEST_MODE = false;
                
                if (SURVEY_TEST_MODE) {
                  console.log("🧪 SURVEY TEST MODE: Forzando encuesta para desarrollo");
                  setSurveyCompleted(false);
                } else {
                  const surveyStatus = await getUserSurveyStatus(user.uid);
                  setSurveyCompleted(surveyStatus.surveyCompleted);
                  console.log("Survey status:", surveyStatus);
                }
              } catch (err) {
                console.error("Error checking survey status:", err);
                setSurveyCompleted(false);
              }
            } else {
              // Para otros niveles, marcar como completado para no interferir
              setSurveyCompleted(true);
            }
          } else {
            console.warn("User exists in authentication but no data in database!");
            setError('No se encontraron datos de usuario. Contacta al administrador.');
          }
          
          setCurrentUser(user);
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError('Error al cargar datos de usuario: ' + err.message);
        }
      } else {
        // Usuario no autenticado
        console.log("Clearing user state (not authenticated)");
        setCurrentUser(null);
        setUserLevel(null);
        setCompanyId(null);
        setSurveyCompleted(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Unsubscribing from auth state");
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userLevel,
    companyId,
    loading,
    error,
    surveyCompleted
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};