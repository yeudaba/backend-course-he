// P26.3-E23: אחרי התיקון
pipeline {
  agent { docker { image 'node:24-alpine' } }
  options {
    timeout(time: 20, unit: 'MINUTES') // תיקון 4: build תקוע לא תופס executor לנצח
  }
  environment {
    REG = credentials('ghcr') // תיקון 1: מ־Jenkins Credentials — יוצר REG_USR ו־REG_PSW, ומסתיר בלוג
  }
  stages {
    stage('Install') {
      steps {
        sh 'npm ci' // תיקון 2: בדיוק לפי package-lock
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Push') {
      when { branch 'main' } // תיקון 3: רק מ־main
      steps {
        sh 'echo $REG_PSW | docker login ghcr.io -u $REG_USR --password-stdin'
        sh 'docker build -t ghcr.io/noa-cohen/coffee-shop:$GIT_COMMIT .'
        sh 'docker push ghcr.io/noa-cohen/coffee-shop:$GIT_COMMIT'
      }
    }
  }
}
