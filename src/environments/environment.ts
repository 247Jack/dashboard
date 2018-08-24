// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  okta_clientId: "0oaeu3zgonjGZw0qE0h7",
  api_domain: "https://15kcv4z18f.execute-api.us-east-1.amazonaws.com/dev",
  socket_host: "https://dev.message-broker.247jack.com/",
  //socket_host: "http://localhost:8443/",
  secureSocket: false,
  self_host: "http://localhost:4200"
  //self_host: "http://dev.dashboard.247jack.com"
};
