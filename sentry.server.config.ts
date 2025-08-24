import * as Sentry from "@sentry/nuxt";
 
Sentry.init({
  dsn: "https://bcaec7653b065098ae649df4014ed2dc@o4508415437307904.ingest.us.sentry.io/4509898014064640",

  // Enable logs to be sent to Sentry
  enableLogs: true,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
