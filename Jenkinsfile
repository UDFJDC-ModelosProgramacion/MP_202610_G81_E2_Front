pipeline {
    agent any

    tools {
        nodejs 'NodeJS 18'
    }

    stages {
        stage('Debug comandos') {
            steps {
                sh 'which node || echo "no hay node"'
                sh 'which npm || echo "no hay npm"'
                sh 'which sonar-scanner || echo "no hay sonar-scanner"'
            }
        }

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar Dependencias') {
            steps {
                sh 'node -v'
                sh 'npm -v'
                sh 'npm install'
            }
        }

        stage('Análisis con SonarQube') {
            environment {
                scannerHome = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('MP_202610_G81_E2_Front') {
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

        stage('Fix permisos') {
            steps {
                sh 'chmod -R +x node_modules/.bin'
            }
        }

        stage('Construir (Build)') {
            steps {
                sh 'npm run build'
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