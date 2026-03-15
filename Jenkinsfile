pipeline {
  agent any

  parameters {
    string(name: 'REPO',       defaultValue: '', description: 'Git repo URL')
    string(name: 'PORT',       defaultValue: '', description: 'Host port assigned by the platform')
    string(name: 'PROJECT_ID', defaultValue: '', description: 'Project ID (from platform)')
    text  (name: 'ENV',        defaultValue: '', description: 'Environment variables (newline separated): KEY=VAL\\nKEY2=VAL2')
    string(name: 'FRAMEWORK')
  }

  environment {
    // Image and container names (per-project)
    IMAGE_NAME    = "app-${PORT}"
    CONTAINER_NAME= "app-${PROJECT_ID}"
    // Set this in Jenkins job global env or override per-job (public host or IP where containers are reachable)
    // Example: PLATFORM_HOST = "192.168.56.101" or "apps.example.com"
    PLATFORM_HOST = "${env.PLATFORM_HOST ?: ''}"
    CALLBACK_URL  = "http://${PLATFORM_HOST}" // we'll append :PORT later
  }

  options {
    // keep logs for a month, change if needed
    buildDiscarder(logRotator(daysToKeepStr: '30'))
    ansiColor('xterm')
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {

    stage('Clean workspace') {
      steps {
        deleteDir()
      }
    }

    stage('Checkout') {
      steps {
        git url: params.REPO, branch: 'main'
      }
    }

    stage('Write .env (optional)') {
  steps {
    script {
      if (params.ENV && params.ENV.trim() != "" && params.ENV != "null") {
        sh """
          echo "${params.ENV}" | tr -d '\\r' | base64 -d > .env
        """
        env.HAS_ENV_FILE = "true"
        echo ".env file created"
      } else {
        env.HAS_ENV_FILE = "false"
        echo "No environment variables provided. Skipping .env creation."
      }
    }
  }
}

    stage('Detect container internal port') {
      steps {
        script {
          // attempt simple heuristics to pick the container (internal) port
          def containerPort = sh(script: '''
            if [ -f package.json ]; then
              if grep -q "\"next\"" package.json; then echo 3000; exit; fi
              if grep -q "\"react-scripts\"" package.json; then echo 3000; exit; fi
              if grep -q "\"express\"" package.json; then echo 3000; exit; fi
            fi
            if [ -f requirements.txt ]; then
              if grep -q "uvicorn" requirements.txt || grep -q "fastapi" requirements.txt; then echo 8000; exit; fi
            fi
            if [ -f pom.xml ] || [ -f build.gradle ]; then
              echo 8080; exit;
            fi
            # default
            echo 3000
          ''', returnStdout: true).trim()
          env.CONTAINER_PORT = containerPort
          echo "Using container internal port: ${containerPort}"
        }
      }
    }

    stage('Select Dockerfile') {
    steps {
        script {
            if (params.FRAMEWORK == "react") {
                sh "cp /opt/dockerfiles/react.Dockerfile Dockerfile"
                env.CONTAINER_PORT = "3000"
            }
            else if (params.FRAMEWORK == "express") {
                sh "cp /opt/dockerfiles/express.Dockerfile Dockerfile"
                env.CONTAINER_PORT = "3000"
            }
            else if (params.FRAMEWORK == "fastapi") {
                sh "cp /opt/dockerfiles/fastapi.Dockerfile Dockerfile"
                env.CONTAINER_PORT = "8000"
            }
            else if (params.FRAMEWORK == "springboot") {
                sh "cp /opt/dockerfiles/springboot.Dockerfile Dockerfile"
                env.CONTAINER_PORT = "8080"
            }
        }
    }
}

    stage('Build Docker image') {
      steps {
        sh """
          docker build -t ${IMAGE_NAME} .
        """
      }
    }

    stage('Stop & remove old container (if exists)') {
      steps {
        sh """
          docker stop ${CONTAINER_NAME} || true
          docker rm ${CONTAINER_NAME} || true
        """
      }
    }

    stage('Run container') {
  steps {
    script {

      def envOption = ""
      if (env.HAS_ENV_FILE == "true") {
        envOption = "--env-file .env"
      }

      def containerId = sh(script: """
        docker run -d \\
          --restart unless-stopped \\
          -p ${params.PORT}:${env.CONTAINER_PORT} \\
          ${envOption} \\
          --name ${CONTAINER_NAME} \\
          ${IMAGE_NAME}
      """, returnStdout: true).trim()

      env.CONTAINER_ID = containerId
    }
  }
}

    stage('Notify platform') {
      steps {
        script {
          // Build the public URL (PLATFORM_HOST must be configured)
          def host = env.PLATFORM_HOST?.trim()
          if (!host) {
            echo "WARNING: PLATFORM_HOST not set; cannot create public URL. Set PLATFORM_HOST at Jenkins job or global environment."
          }
          def publicUrl = host ? "http://${host}:${params.PORT}" : "http://<host-not-configured>:${params.PORT}"

          // Notify platform API: replace '/api/deploy/complete' with your callback route if different
          def payload = groovy.json.JsonOutput.toJson([
            projectId  : params.PROJECT_ID,
            containerId: env.CONTAINER_ID,
            status     : "running",
            url        : publicUrl,
            port       : params.PORT
          ])

          echo "Notifying platform with payload: ${payload}"
          sh """
            curl -s -X POST ${env.CALLBACK_URL}/api/deploy/complete \\
              -H 'Content-Type: application/json' \\
              -d '${payload}'
          """
        }
      }
    }

  } // stages

  post {
    success {
      echo "Pipeline finished SUCCESS"
    }
    failure {
      script {
        // Notify platform of failure
        def payload = groovy.json.JsonOutput.toJson([
          projectId: params.PROJECT_ID,
          status: "failed"
        ])
        sh """
          curl -s -X POST ${env.CALLBACK_URL}/api/deploy/complete \\
            -H 'Content-Type: application/json' \\
            -d '${payload}'
        """
      }
    }
    cleanup {
      echo "Cleaning up workspace"
    }
  }

}