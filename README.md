# ¡Welcome to Jack Dashboard Source Code! 

<img src="src/assets/images/jack_icon.gif" alt="drawing" width="200px"/>

## ¿How debug this project?

If you are using VSCode as text editor you can install the official Microsoft VSCode extension that allows you to debug on chrome [(Click here)](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome).

After installing it, you should go to the Debug button on the VSCode left menu, and click the gear icon and select Chrome. 

Then, VSCode will auto-generate a **_launch.json_** file inside of _.vscode_ folder.

Finally, verify that the body of that JSON file matches the following values and properties:

```json
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "Launch Chrome",
            "sourceMaps": true,
            "url": "http://localhost:4200",
            "webRoot": "${workspaceFolder}"
        }
    ]
```

---

# Angular Basic Commands

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.8.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
