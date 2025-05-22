# Jobby - Plataforma de Gestión de Beneficios Laborales

Jobby es una aplicación web para la gestión de beneficios laborales, permitiendo a las empresas ofrecer y administrar diferentes tipos de beneficios para sus empleados.

## Estructura del Proyecto

El proyecto tiene una arquitectura basada en niveles de usuarios, cada uno con sus propias funcionalidades:

1. **Nivel 1 - Administración Jobby**: Gestiona empresas, usuarios y beneficios Jobby.
2. **Nivel 2 - Recursos Humanos**: Administra beneficios internos y usuarios de la empresa.
3. **Nivel 3 - Usuarios**: Empleados que pueden solicitar y usar beneficios.
4. **Nivel 4 - Proveedores**: Verifican y procesan tokens de beneficios.

## Tecnologías Utilizadas

- React
- Firebase Authentication
- Firebase Realtime Database
- React Router

## Instalación

1. Clona el repositorio:
```
git clone https://github.com/tuusuario/jobby.git
cd jobby
```

2. Instala las dependencias:
```
npm install
```

3. Inicia el servidor de desarrollo:
```
npm start
```

## Configuración de Firebase

Este proyecto utiliza Firebase para autenticación y base de datos. La configuración ya está incluida en el proyecto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA0zN84SxP4pXd-lf8lguw699Q_qYOrlU4",
  authDomain: "jobby-c3197.firebaseapp.com",
  databaseURL: "https://jobby-c3197-default-rtdb.firebaseio.com",
  projectId: "jobby-c3197",
  storageBucket: "jobby-c3197.firebasestorage.app",
  messagingSenderId: "327717152915",
  appId: "1:327717152915:web:0a5457734d2560dcb9c566"
};
```

## Estructura de Usuarios

- **Nivel 1 (Administración Jobby)**: Correos con dominio `@jobby.cl`
- **Nivel 2 (Recursos Humanos)**: Correos con formato `admin@nombreempresa`
- **Nivel 3 (Usuarios)**: Correos con formato `nombre@nombreempresa`
- **Nivel 4 (Proveedores)**: Correos con dominio `@jobby.sup`

## Estructura de la Base de Datos

- `users`: Información de usuarios
- `companies`: Información de empresas
- `jobby_benefits`: Beneficios ofrecidos por Jobby
- `company_benefits`: Beneficios internos de cada empresa
- `benefit_requests`: Solicitudes de beneficios
- `benefit_tokens`: Tokens generados para beneficios aprobados

## Flujo de Beneficios

1. Nivel 1 crea beneficios Jobby y gestiona empresas
2. Nivel 2 gestiona beneficios internos y usuarios de su empresa
3. Nivel 3 solicita beneficios (Jobby o internos)
4. La solicitud es aprobada por Nivel 1 (beneficios Jobby) o Nivel 2 (beneficios internos)
5. Se genera un token para el beneficio aprobado
6. El usuario (Nivel 3) presenta el token al proveedor
7. El proveedor (Nivel 4) verifica y marca el token como utilizado

## Tipos de Beneficios Jobby

- **Automáticos**: Beneficios inmediatos (ej. comida en restaurante)
- **De Gestión**: Requieren agendar con profesionales
- **De Terceros**: Compras o servicios externos (ej. entradas a eventos)

## Licencia

Este proyecto es de uso privado para Jobby.