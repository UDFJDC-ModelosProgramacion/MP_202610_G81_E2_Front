# Frontend - Plataforma de Adopción de Mascotas

## 🚀 Guía paso a paso para iniciar la aplicación

Para ejecutar la aplicación en tu computadora, sigue detalladamente los pasos a continuación.

### 1. Pre-requisitos (Instalar Node.js)
Debes tener instalado **Node.js** para ejecutar este proyecto. Si no lo tienes, descárgalo e instálalo según tu sistema operativo:
- **Windows y Mac**: Ve a la página oficial de [Node.js](https://nodejs.org/) y descarga el instalador "Recomendado para la mayoría" (versión LTS). Sigue los pasos del instalador como con cualquier programa común.
- **Linux (Ubuntu/Debian)**: Abre tu terminal e instala Node.js ejecutando:
  ```bash
  sudo apt update
  sudo apt install nodejs npm
  ```

### 2. Descargar el proyecto
Necesitas descargar los archivos a tu computadora:
- **Opción A (Con Git)**: Si tienes Git, abre tu terminal y clona el repositorio ejecutando:
  `git clone https://github.com/UDFJDC-ModelosProgramacion/MP_202610_G81_E2_Front.git` (Asegúrate de reemplazar con el link del repositorio).
- **Opción B (Descarga normal)**: Ve a la página del repositorio, presiona el botón verde **"Code"** y luego **"Download ZIP"**. Al terminar, haz clic derecho sobre el archivo ZIP y extráelo (descomprímelo).

### 3. Abrir la terminal en la carpeta
Debes indicarle a la terminal que trabaje sobre la carpeta del proyecto (`MP_202610_G81_E2_Front`):
- **Windows**: Entra a la carpeta del frontend, haz clic derecho en un espacio vacío y elige **"Abrir en Terminal"** (o en PowerShell).
- **Mac**: Entra a la carpeta del frontend, haz clic derecho (o clic con dos dedos) sobre ella y selecciona **"Nueva terminal en la carpeta"**.
- **Linux**: Entra a la carpeta del frontend, haz clic derecho y selecciona **"Abrir en la terminal"**.

### 4. Instalar las dependencias
En la ventana negra (terminal) que acabas de abrir, escribe el siguiente comando y presiona `Enter`. Esto descargará lo necesario para que la interfaz funcione:
```bash
npm install
```

### 5. Iniciar la aplicación
Cuando el paso anterior finalice, ejecuta el comando para prender la aplicación:
```bash
npm run dev
```

La terminal te mostrará un enlace (usualmente `http://localhost:5173/`). Solo cópialo y pégalo en tu navegador para ver la página web.

> **Nota importante:** Recuerda que para iniciar sesión o guardar datos, tu aplicación del Backend (Spring Boot) también debe estar iniciada.

---

## Implementaciones
Se han implementado las siguientes historias de usuario:

| Historia de usuario | Responsable |
|---|---|
| HU01 Registro | Sofía Rivera Fernández |
| HU04 Crear shelter | Karen Johanna Cabezas Herrera |
| HU07 Crear mascota | Sergio Leonardo Moreno Granado |
| HU10 Solicitar | Anderson Danilo Bonilla Martínez |
