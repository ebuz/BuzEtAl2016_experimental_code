# Pressing fixes #
1. Check again for typos
1. Check again for typos, seriously
1. Change the payment to something like $.50 plus bonus based on trials completed.
1. There is a replay issue when wami is being set up in the instructions. It's because wami-helper.js that is in this repo is not the one that is used on www.

# Nice things to add #
1. Catch trials where we have speakers type in the three words that are presented instead of speaking the cued word.
1. Add in some way to skip ahead in a trial while in debug mode.
1. Catch trials: words show up, all three words are boxed, they all go away, a new screen appears that gives a forced choice asking about something (i.e. asking about if a word was or was not present on the previous screen, half yes half no, if yes randomly drawn from one of the positions, the no should be monosyllabic and similar looking to the other stimuli).

# Files that have to change for any given change of the experiment #
1. the db_init.py program is hard-coded to generate the possible lists so if the number of lists changes so should this
1. any changes to the feedback procedure needs to be reflected in the instructions.html file and probably also the survey.html file
1. if the experiment moves from testing to live, the form under expt.cfg needs to be changed
1. YOU SHOULD MAKE SURE THE STIMULI.CSV FILES HAS THE NEW EXPERIMENT NAME
1. Any of the above changes ultimately require a change to the /mturk/* files, especially the .properties and .question files
1. the javascript file needs to be updated with the url of the experiment in order for the ajax/json data to be correctly sent (this later point is important if the url will change with each new version of the experiment, otherwise it could be keep as baese-berk_goldrick_rep and the server files changed to reflect this. note the lack of a 1 there).

# timings #
1. Currently, time in milliseconds is captured before WAMI starts to record, ends recording, the words appear, the cue appears and the timer stops.
1. In addition to the above things, it may be good to also capture time immediately after these calls have been made, one out of curriosity and two to see what sort of lag is occuring between them (some might also be part of the callback functions so there are three timings done: before and after in line calls and after inside calls

# misc #
1. attribute the noun project and authors:
  1. Network designed by Stephen Boak from The Noun Project
  2. Headphones from The Noun Project
1. clean up any parts of the code that may speed up functionality
1. the server, once in a while, spits out some baroquely described errors that may be important to work out, could just be related to reloading the page
