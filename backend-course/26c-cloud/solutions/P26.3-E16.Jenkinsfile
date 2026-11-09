// P26.3-E16: pipeline של coffee-api ב־Jenkins
pipeline {
  agent { docker { image 'node:24-alpine' } }

  options {
    timeout(time: 20, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  environment {
    IMAGE = 'ghcr.io/noa-cohen/coffee-shop'
    TAG = "${env.GIT_COMMIT.take(7)}"
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    stage('Lint & Typecheck') {
      steps {
        sh 'npm run lint'
        sh 'npm run typecheck'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Build image') {
      steps {
        sh 'docker build -t $IMAGE:$TAG .'
      }
    }
    stage('Push image') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr', usernameVariable: 'REG_USER', passwordVariable: 'REG_TOKEN')]) {
          sh 'echo $REG_TOKEN | docker login ghcr.io -u $REG_USER --password-stdin'
          sh 'docker push $IMAGE:$TAG'
        }
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: 'reports/junit.xml'
    }
    failure {
      echo "Build failed: ${env.BUILD_URL}"
    }
  }
}
