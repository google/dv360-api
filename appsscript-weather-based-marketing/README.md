# Apps Script Weather Based Marketing

We introduce you a Google Sheets based DV360 campaign management system which automatically enables or disables Line Items (or/and Insertion Orders) with Display or TrueView (e.g. HTML5 or YouTube) creatives based on the current temperature and precipitation (rain or snow) in the region.

This is an External Signal Based Marketing example, where the external trigger is the Weather in the specified region. Technically this solution uses an output of the [OpenWeather API](https://openweathermap.org/api) to manage your campaign through the [DV360 API](https://developers.google.com/display-video/api/reference/rest).

# Installation: Apps Script Project Setup

We recommend using [clasp](https://github.com/google/clasp) to set up your Apps Script project. Just do the following:

1.  Download the code to your working environment (e.g. `git clone
    https://github.com/google/dv360-api.git`)
1.  Go to the directory with the Apps Script code (e.g. `cd
    dv360-api/appsscript-weather-based-marketing/`)
1.  [Create a new Google Spreadsheet](https://docs.google.com/spreadsheets/) or use an existing Google Spreadsheet
1.  [Install clasp](https://github.com/google/clasp#install)
1.  [Authenticate clasp](https://github.com/google/clasp#login)
1.  [Clone Apps Script](https://github.com/google/clasp#clone). Important: you need to specify the apps script project ID, not the spreadsheet ID (see the next section)
1.  Push code to the G-Suite project (e.g. `clasp push -f` or if you want your local changes to be automatically synced with the G-Suite project while you edit files `clasp push -w -f`)

## Clasp set up errors

If you run `clasp clone <ID>` and you see an error message:
```
$ clasp clone 1PqSxqJtOrxtf5doK6HY32FnSqIKg2p0ez0i11112haE
Could not find script.
Did you provide the correct scriptId?
Are you logged in to the correct account with the script?
```

*First*, you should use your _script_ ID and not _spreadsheet_ ID. Where to find the script ID associated with your spreadsheet? See below:

In the spreadsheet menu click on the "Tools > Script editor".

![Click on the "Tools > Script editor"](../imgs/tools-script-editor.png?raw=true)

From the opened browser window copy a part of the URL with the script ID (this is the part which is between `/d/` and `/edit`). As an alternative you can click "File > Project properties" in the script editor.

![Copy a part of the URL with the script ID](../imgs/script-id.png?raw=true)

*Second*, please make sure you use the ID of a script that you have access to.

After you copied the correct script ID please run [clasp clone <ID>](https://github.com/google/clasp#clone) again. In case you see a message `Project file (.clasp.json) already exists.` you can simply remove this file `rm .clasp.json` and run the command again.

## Spreadsheet setup

First, please make sure you ran `clasp push -f` and you can see the project files in the
script editor. After reloading the Script Editor window it should look like this:

![Project files](../imgs/apps-script-files.png?raw=true)

Now please go back to the spreadsheet. After reloading the window you should see a new menu item "Weather Based Marketing":

![Spreadsheet menu](../imgs/spreadsheet-menu.png?raw=true)

In order to create an example sheet with the default DV360 advertiser configuration please click on the newly created menu item "Weather Based Marketing > Create a test config". Most probably you will be asked to authorize the script to run under your account. For more information please check [the developer guide](https://developers.google.com/apps-script/guides/services/authorization).

![Authorization required](../imgs/authorization-required.png?raw=true)

After successful authorization you need to click the menu item ("Weather Based Marketing > Create a test config") one more time. Now you should be able to see a newly created sheet (tab) in your spreadsheet:

![Advertiser config sheet](../imgs/advertiser-config-sheet.png?raw=true)

Please configure the newly created table: 
- DV360: `Advertiser ID` and `Line Item ID` (or `Insertion Order Id`) - integer numbers. By default the script works with the line items, but you can easily adjust it to use insertion orders, just check the code from the file "main.gs" file. `Advertiser ID` is a mandatory, since it is used in the DV360 API requests. **Note**: you need a **write access** to the Line Item (or Insertion order) to be able to Activate/Pause its status through DV360 API. 
- Geo: `Latitude`, `Longitude` (floating-point numbers) for the place you want to target. To get this geo data you can just google "Latitude Longitude <CITY_NAME>" (e.g. "Latitude Longitude Hamburg"). Please note: this setting does not influence targeting in DV360, it is used only for OpenWeather API requests.
- Weather: `Min. Temperature`, `Max. Temparature` (floating-point number), `Only when Raining/Snowing` (0 = Off/False, 1 = On/True). These are the weather settings that manage your DV360 campaign logic (if the weather conditions at the moment of OpenWeather API in that geo location are satisfying these conditions then the line item will be turned on, else it will be paused):
    - You can leave one of the temperature ranges blank (either Min. or Max.). E.g. if you specify `Max. Temperature = 10` and leave `Min. Temperature` blank, then the campign will be on only in case the temperature in the specified geo location is below 10°C (OpenWeather API also can work with the Fahrenheit scale "°F").
    - If you set `Only when Raining/Snowing = 1` then the campign will be on only in case there is either rain or snow in the specified geo location.
- Other columns that marked "Do not edit" are used by Apps Script for logging purposes.
- Add as many rows as you have line items (or insertion orders, depending on your DV360 campaign set up)

## OpenWeather API set up

After setting up the advertisers sheet you are almost ready to run the campaign. Actually you can try to do so. Please go to the spreadsheet and click "Weather Based Marketing > Check weather and sync DV360".

![Check weather](../imgs/check-weather.png?raw=true)

If you haven't set your OpenWeather API key you will see an error:
```
OpenWeather API key cannot be empty. Please edit "config.gs"
```
![OpenWeather API error](../imgs/openweather-api-error.png?raw=true)
To fix this you need to go to the [classes/config.gs](openweather-based-bidding/classes/config.gs) (either in the script editor or in your local file, which should be then uploaded by `clasp push`) and add your OpenWeather API key, e.g.:
```
'open-weather-api-key': '<Your API Key>',
```

After you set the key you can run "Weather Based Marketing > Check weather and sync DV360" again. After the script finishes its work you will see a "Done" popup message and script logs will be in the columns `Current Temperature`, `Current Raining/Snowing`, `DV360 Status`, `Last Updated`.

## Scheduling (set up a time-based Trigger)

Most probably you don't want to run the script manually every hour/day/week/etc. For this you can use [time driven triggers](https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers). 

In the script editor go to "Edit > Current project's triggers".

![Advertiser config sheet](../imgs/triggers.png?raw=true)

Add a trigger by clicking "+ Add Trigger" in the lower right corner.

![Add trigger](../imgs/add-trigger.png?raw=true)

Specify the function and schedule: 
- "Choose which function to run" = "monitorWeatherAndSyncWithDV360"
- "Choose which deployment should run" = "Head"
- "Select event source" = "Time-driven"
- "Select type of time based trigger" = "Day timer" (to run once per day)
- "Select time of day" = "7am to 8am" (to run in the morning)

![Time trigger](../imgs/time-trigger.png?raw=true)

Add as many triggers as you need. E.g. you can run one trigger in the morning and one in the evening.

# Contribution

If you want to contribute to the project you can fork us on GitHub. Also if you liked our open source project give us a star on GitHub.

![GitHub](../imgs/github.png?raw=true)
