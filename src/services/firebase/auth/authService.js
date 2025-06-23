import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get, update } from "firebase/database";
import { auth, database } from "../config";

// Identificar nivel de usuario basado en email
export const getUserLevel = (email) => {
  console.log("Determinando nivel de usuario para email:", email);
  
  if (email.endsWith('@jobby.cl')) {
    console.log("Email termina con @jobby.cl -> Nivel 1");
    return 1; // Nivel 1: Administración Jobby
  } else if (email.startsWith('admin@')) {
    console.log("Email comienza con admin@ -> Nivel 2");
    return 2; // Nivel 2: Recursos Humanos de empresa
  } else if (email.endsWith('@jobby.sup')) {
    console.log("Email termina con @jobby.sup -> Nivel 4");
    return 4; // Nivel 4: Proveedores
  } else {
    console.log("Email con otro formato -> Nivel 3");
    return 3; // Nivel 3: Usuario final de empresa
  }
};

// Extraer companyId del email para usuarios de nivel 2 y 3
export const extractCompanyIdFromEmail = (email) => {
  const level = getUserLevel(email);
  
  if (level === 2) {
    // Para admin@empresa.com, extraer "empresa"
    const match = email.match(/admin@([^.]+)/);
    return match ? match[1] : null;
  } else if (level === 3) {
    // Para usuario@empresa.com, extraer "empresa"
    const match = email.match(/@([^.]+)/);
    return match ? match[1] : null;
  }
  
  return null;
};

// Encontrar o crear companyId para usuarios de nivel 2 y 3
const resolveCompanyId = async (email) => {
  const level = getUserLevel(email);
  
  if (level !== 2 && level !== 3) {
    return null;
  }
  
  const companyName = extractCompanyIdFromEmail(email);
  
  if (!companyName) {
    return null;
  }
  
  // Buscar si la empresa ya existe
  const companiesRef = ref(database, 'companies');
  const snapshot = await get(companiesRef);
  
  if (snapshot.exists()) {
    let existingCompanyId = null;
    
    snapshot.forEach((childSnapshot) => {
      const companyData = childSnapshot.val();
      
      if (companyData.name && companyData.name.toLowerCase() === companyName.toLowerCase()) {
        existingCompanyId = childSnapshot.key;
      }
    });
    
    if (existingCompanyId) {
      return existingCompanyId;
    }
  }
  
  // Si no existe y es nivel 2 (admin), crear la empresa
  if (level === 2) {
    const newCompanyRef = ref(database, `companies/${companyName}`);
    await set(newCompanyRef, {
      name: companyName,
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    
    return companyName;
  }
  
  return null;
};

// Crear nuevo usuario
export const registerUser = async (email, password, displayName, userType = 'A') => {
  try {
    console.log("Registrando usuario con email:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Actualizar perfil con nombre
    await updateProfile(user, { displayName });
    
    // Determinar nivel basado en el email
    const userLevel = getUserLevel(email);
    console.log("Nivel de usuario determinado:", userLevel);
    
    // Resolver companyId para usuarios de nivel 2 y 3
    const companyId = await resolveCompanyId(email);
    console.log("Company ID resuelto:", companyId);
    
    // Guardar datos de usuario en la base de datos
    await set(ref(database, `users/${user.uid}`), {
      email,
      displayName,
      level: userLevel,
      companyId,
      userType, // Agregar tipo de usuario
      createdAt: new Date().toISOString()
    });
    
    console.log("Datos de usuario guardados en la base de datos");
    return { user };
  } catch (error) {
    console.error("Error en registro:", error);
    throw error;
  }
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    console.log("Intentando iniciar sesión con email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obtener datos adicionales del usuario
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);
    let userData = {};
    
    if (snapshot.exists()) {
      userData = snapshot.val();
      console.log("Datos de usuario encontrados:", userData);
      
      // Si el usuario no tiene level en la base de datos, actualizarlo
      if (!userData.level) {
        const userLevel = getUserLevel(email);
        console.log("Usuario sin nivel, asignando nivel:", userLevel);
        const companyId = await resolveCompanyId(email);
        
        await update(userRef, { 
          level: userLevel,
          companyId,
          updatedAt: new Date().toISOString() 
        });
        
        userData = {
          ...userData,
          level: userLevel,
          companyId
        };
      }
    } else {
      console.warn("Usuario autenticado pero sin datos en la base de datos, creando registro");
      
      // Si el usuario no tiene registro en la base de datos, crearlo
      const userLevel = getUserLevel(email);
      const companyId = await resolveCompanyId(email);
      
      userData = {
        email,
        displayName: user.displayName || email,
        level: userLevel,
        companyId,
        createdAt: new Date().toISOString()
      };
      
      await set(userRef, userData);
      console.log("Datos de usuario guardados:", userData);
    }
    
    return { user, userData };
  } catch (error) {
    console.error("Error en login:", error);
    throw error;
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Restablecer contraseña
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Observador del estado de autenticación
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};