Beatport does not have consistent indexing of their monthly "top 100" charts for individual genres.
After the month passes the chart was created for a given genre, it can no longer be easily found on the site when searching charts.
Beatport does not support search engines collecting these charts, either.
In order to find top 100 playlists for months you cannot navigate to in the user interface, they must be scraped directly from the site.
Format for charts is as follows:
https://www.beatport.com/chart/best-new-indie-dance-june/777947
The second path directory is meaningless ('best-new-indie-dance-june').
Only the final number actually pulls up a chart.
https://www.beatport.com/chart/XYZ/777947
The chart will contain this in the name if it is their 'best new' chart:
This scraper will iterate through a starting chart number a given number of times and extract all 'best of' charts it finds published by Beatport.
The results will be written to a CSV file.
