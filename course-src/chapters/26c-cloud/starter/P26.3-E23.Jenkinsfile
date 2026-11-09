// P26.3-E23: ה־pipeline הזה "עובד" — וארבעה דברים בו לא בסדר
pipeline {
  agent { docker { image 'node:24-alpine' } }
  environment {
    REG_USER = 'noa-cohen'
    REG_TOKEN = 'ghp_9fXk2LmQ7rT4vB8nC1wE6yH3jK5pS0aD'
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Push') {
      steps {
        sh "echo ${REG_TOKEN} | docker login ghcr.io -u ${REG_USER} --password-stdin"
        sh 'docker build -t ghcr.io/noa-cohen/coffee-shop:$GIT_COMMIT .'
        sh 'docker push ghcr.io/noa-cohen/coffee-shop:$GIT_COMMIT'
      }
    }
  }
}
