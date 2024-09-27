# accName
A simple accessible name finder

A simple function to a JavaScript bookmarklet that displays accessible name information about HTML elements when hovering the mouse.
It shows the element's name (tagName, ID, class) and accessible attributes (such as aria-label, alt, etc.), truncated to 120 characters if necessary.
The script excludes elements like div, html, and body tags.

## Bookmarklet: 
```
javascript:void%20function(){var%20a=document.head,b=document.createElement(%22script%22);b.src=%22https://christopherabate.github.io/accName/bookmarklet.js%22,a.appendChild(b)}();
```
