import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA0zN84SxP4pXd-lf8lguw699Q_qYOrlU4",
  authDomain: "jobby-c3197.firebaseapp.com",
  databaseURL: "https://jobby-c3197-default-rtdb.firebaseio.com",
  projectId: "jobby-c3197",
  storageBucket: "jobby-c3197.firebasestorage.app",
  messagingSenderId: "327717152915",
  appId: "1:327717152915:web:0a5457734d2560dcb9c566"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Función para crear un usuario de nivel 1
async function createAdminUser() {
  // Datos del usuario administrador
  const email = "admin@jobby.cl";
  const password = "jobby123";  // ¡Cambia esto en producción!
  const displayName = "Admin Jobby";

  try {
    // Crear usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("Usuario creado exitosamente:", user.uid);

    // Actualizar perfil con nombre
    await updateProfile(user, { displayName });
    console.log("Perfil actualizado con nombre:", displayName);

    // Guardar datos adicionales en la base de datos
    await set(ref(database, `users/${user.uid}`), {
      email,
      displayName,
      level: 1,  // Nivel 1 para administradores Jobby
      createdAt: new Date().toISOString()
    });
    
    console.log("Datos de usuario guardados en la base de datos");
    console.log("Usuario de nivel 1 creado correctamente");
    
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error("Error al crear usuario:", error.code, error.message);
    return { success: false, error };
  }
}

// Ejecutar la función
createAdminUser()
  .then(result => {
    if (result.success) {
      console.log("Usuario creado con ID:", result.userId);
    } else {
      console.error("No se pudo crear el usuario:", result.error);
    }
  })
  .catch(error => {
    console.error("Error inesperado:", error);
  });