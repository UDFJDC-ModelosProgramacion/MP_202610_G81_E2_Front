pipeline {
    agent {
        docker {
            image 'node:18'
        }
    }

    tools {
        nodejs 'NodeJS 18' // Cambia esto si en tu Jenkins le pusiste otro nombre a la instalación de Node
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                sh 'npm install'
            }
        }

        stage('Análisis con SonarQube') {
            environment {
                scannerHome = tool 'SonarQubeScanner' // Cambia por el nombre de tu herramienta en Jenkins
            }
            steps {
                withSonarQubeEnv('MP_202610_G81_E2_Front') { // Cambia por el nombre de tu servidor en Jenkins
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Construir (Build)') {
            steps {
                // Vite usa este comando para generar la versión de producción en la carpeta 'dist'
                bat 'npm isntall'
                bat 'npm run build'
            
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline completado exitosamente.'
        }
        failure {
            echo '❌ El pipeline falló.'
        }
    }
}