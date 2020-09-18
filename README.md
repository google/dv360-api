# DV360 Write API Code Examples

This repository contains code examples for the DV360 Write API. Especially:

*   [DV360 Weather Based Trigger](https://github.com/google/dv360-write-api/tree/master/openweather-based-bidding)
*   ... stay tuned, we are going to add more

## Weather Based Trigger

This is external based trigger example, where external trigger is output of the
[OpenWeather API](https://openweathermap.org/api).

# Apps Script Project Set Up

We recomend to use [clasp](https://github.com/google/clasp) to set up your Apps
Script project. Just do the following:

1.  Download the code to your working environment (e.g. `git clone
    https://github.com/google/dv360-write-api.git`)
1.  Go to the directory with the Apps Script code (e.g. `cd
    dv360-write-api/openweather-based-bidding/`)
1.  [Create a new Google Spreadsheet](https://docs.google.com/spreadsheets/) or
    use an existing Google Spreadsheet
1.  [Install clasp](https://github.com/google/clasp#install)
1.  [Log in clasp](https://github.com/google/clasp#login)
1.  [Clone clasp](https://github.com/google/clasp#clone)
1.  Push code to the G-Suite project (e.g. `clasp push -f` or if you want your
    local changes to be automatically synced with the G-Suite project while you
    edit files `clasp push -w -f`)
