Write It
======

A website that allows users to collaboratively tell the story of their choosing. Users can submit and vote on whatever happens next, and every few minutes the server automatically appends the highest-rated suggestion to the story. When the story is deemed complete, it will automatically archive the old story and switch to a fresh one.

Future features
---------------
* A chat room, so users can talk to each other and come up with amazing suggestions.
* Private stories, apart from the main public one, so users can have fun with their friends.
* Spell-check and better spam detection on sentence suggestions.
* Automatic story switching and voting.
* The ability to vote on when a story should end, and when a new paragraph should be started.
* Multiple main public stories (maybe a few different genres and one for each genre?)

Running the code
------------
<b>Requirements</b>
* node.js
* npm
* MongoDB
* the dependencies listed in `package.json`

First copy the file `src/config-sample.js` and rename it to `src/config.js`. 
Make sure you fill in your Facebook app credentials and change your cookie secret :)

Then `npm install` to install dependencies and `npm start` or `npm start-script prod` 
depending on if you want a development or production environment.
