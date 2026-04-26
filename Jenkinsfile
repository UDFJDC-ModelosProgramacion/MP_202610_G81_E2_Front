pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                bat 'node -v'
                bat 'npm install'
            }
        }

        stage('Análisis con SonarQube') {
            environment {
                scannerHome = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('MP_202610_G81_E2_Front') {
                    bat "%scannerHome%\\bin\\sonar-scanner.bat"
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
                bat 'npm run build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline OK'
        }
        failure {
            echo 'Pipeline FAIL'
        }
    }
}