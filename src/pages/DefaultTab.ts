import * as express from "express";
let fs = require("fs");
let path = require("path");
import * as config from "config";

export class DefaultTab {

    public static getRequestHandler(): express.RequestHandler {
        return async function (req: any, res: any, next: any): Promise<void> {
            try {
                let htmlPage = `<!DOCTYPE html>
                    <html>
                    <head>
                        <title>Bot Info</title>
                        <meta charset="utf-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link rel="stylesheet" type="text/css" href="/css/custom.css" >
                        <link rel="stylesheet" type="text/css" href="/css/msteams-16.css" >
                        <script src='https://statics.teams.microsoft.com/sdk/v1.2/js/MicrosoftTeams.min.js'></script>
                        <script src='https://code.jquery.com/jquery-1.11.3.min.js'></script>
                    </head>

                    <body class="theme-light">
                        <p>
                            These are links to the source code for all of the example dialogs given in the template.
                        </p>`;

                let files = fs.readdirSync("./public/exampleDialogs");
                for (let i = 0; i < files.length; i++) {
                    let currFile = files[i];
                    let fileName = path.parse(currFile).name;
                    let fileExtension = path.parse(currFile).ext;
                    if (fileExtension === ".txt") {
                        htmlPage += `<br>
                        <a href="/exampleDialogs/` + fileName +  `.txt">` + fileName + `.ts</a>`;
                    }
                }

                htmlPage += `
                    <br>
                    <br>
                    <br>
                    <button onclick="showAllCommands()" class="button-secondary">Click to See All Commands</button>
                    <br>
                    <p>NOTE: Trying to get the deeplink when this is a static tab does not work. This feature only works when this is a configurable tab.</p>
                    <button onclick="getDeeplink()" class="button-secondary">Click to get a deeplink to this tab</button>
                    <br>
                    <br>
                    <button id="showContextButton" onclick="showContext()" class="button-secondary">Click to Show Tab's Context</button>
                    <p id="currentTheme"></p>
                    <p id="contextOutput"></p>
                    <script>
                        var microsoftTeams;

                        $(document).ready(function () {
                            console.log("page loaded");
                            microsoftTeams.initialize();
                            microsoftTeams.registerOnThemeChangeHandler(function(theme) {
                                document.getElementById('currentTheme').innerHTML = theme;
                            });
                        });

                        function showAllCommands() {
                            window.location = "${config.get("app.baseUri") + "/allCommands"}";
                        }

                        function getDeeplink() {
                            microsoftTeams.getContext((context) => {
                                if (context.channelId === "") {
                                  alert("Deep links to static tabs are not yet supported.");
                                }
                                else {
                                  microsoftTeams.shareDeepLink({subEntityId: 'stuff', subEntityLabel: 'stuff2'});
                                }
                            });
                        }

                        function showContext() {
                            microsoftTeams.getContext((context) => {
                                document.getElementById('contextOutput').innerHTML = JSON.stringify(context);
                                document.getElementById('currentTheme').innerHTML = "Current theme: " + context.theme;
                            });
                        }
                    </script>
                    </body>
                    </html>`;

                res.send(htmlPage);
            } catch (e) {
                // Don't log expected errors - error is probably from there not being example dialogs
                res.send(`<html>
                    <body>
                    <p>
                        Sorry. There are no example dialogs to display.
                    </p>
                    <br>
                    <img src="/tab/error_generic.png" alt="default image" />
                    </body>
                    </html>`);
            }
        };
    }
}
