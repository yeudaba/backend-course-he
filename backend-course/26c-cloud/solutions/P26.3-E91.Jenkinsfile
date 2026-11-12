// P26.3-E91: Jenkinsfile שמעדכן את repo התצורה
pipeline {
  agent { docker { image 'node:24-alpine' } }
  environment {
    IMAGE = 'ghcr.io/noa-cohen/coffee-shop'
  }
  stages {
    stage('Test') {
      steps {
        sh 'npm ci'
        sh 'npm test'
      }
    }
    stage('Push image') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr', usernameVariable: 'REG_USER', passwordVariable: 'REG_TOKEN')]) {
          sh 'echo $REG_TOKEN | docker login ghcr.io -u $REG_USER --password-stdin'
          sh 'docker build -t $IMAGE:$GIT_COMMIT . && docker push $IMAGE:$GIT_COMMIT'
        }
      }
    }
    stage('Update config') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'config-repo', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
          sh '''
            git clone https://$GIT_USER:$GIT_TOKEN@github.com/noa-cohen/coffee-deploy.git deploy
            cd deploy
            sed -i "s/^\\(\\s*tag:\\).*/\\1 \\"$GIT_COMMIT\\"/" charts/coffee-api/values-staging.yaml
            git -c user.name=jenkins -c user.email=ci@coffee.example commit -am "staging: coffee-api $GIT_COMMIT"
            git push origin main
          '''
        }
      }
    }
  }
  post {
    failure { echo 'Build failed' }
  }
}
