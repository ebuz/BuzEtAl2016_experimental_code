# Files that have to change for any given change of the experiment #
1. the db_init.py program is hard-coded to generate the possible lists so if the number of lists changes so should this
1. any changes to the feedback procedure needs to be reflected in the instructions.html file and probably also the survey.html file
1. if the experiment moves from testing to live, the form under expt.cfg needs to be changed
1. YOU SHOULD MAKE SURE THE STIMULI.CSV FILES HAS THE NEW EXPERIMENT NAME
1. Any of the above changes ultimately require a change to the /mturk/* files, especially the .properties and .question files
1. the javascript file needs to be updated with the url of the experiment in order for the ajax/json data to be correctly sent (this later point is important if the url will change with each new version of the experiment, otherwise it could be keep as baese-berk_goldrick_rep and the server files changed to reflect this. note the lack of a 1 there).

# Dealing with partner timings #
* test practice trial code, and early stopping code, and regular trial code

# misc #
attribute the noun project and authors:
1. Network designed by Stephen Boak from The Noun Project
2. Headphones from The Noun Project
