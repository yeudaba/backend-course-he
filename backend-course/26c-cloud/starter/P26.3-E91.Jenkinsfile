// P26.3-E91: Jenkinsfile שמעדכן את repo התצורה
// stages: Test → Push image (main) → Update config (main)
// Update config: withCredentials config-repo (GIT_USER, GIT_TOKEN) · clone coffee-deploy · tag ב־values-staging.yaml · commit · push
// סודות רק במרכאות בודדות · בלי kubectl ובלי helm · post { failure { … } }
//
// בדיקה:  npm run check P26.3-E91
