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

# survey questions #
The end survey has to be fixed, right now it gives the same survey to everyone but that needs to change given the type of feedback each participant is getting. These questions have to be asked as well:
1. How fast did your partner click? (1 to 7 scale)
1. How acruate was your partner? (1 to 7 scale)

1. Did your parter fail to provide a response? (how often? 1 to 100 menu)
1. Did your partner respond before you finished speaking? (how often? 1 to 100 menu)
1. Did your parter respond before you started speaking? (how often? 1 to 100 menu)
1. How much delay do you think there was between you speaking and your partner hearing (1 to 7 scale)

1. Did you notice anything weird about the experiment? (text box)
1. Did you notice anything weird about your partner? (text box)

1. If we told you that some of our participants were assigned to humans and some to computers, would you say your partner was a human or computer (1 to 7 scale)

survey pg1 - questions about the website and participant's computer/mic
survey pg2 - questions about partner
survey pg3 - questions about participant/demographics
survey pg4 - debrief and questions about partner


# survey organization #
questions that are asked of everyone that are not partner related:
1. Age
1. Education
1. Gender
1. Accent
1. Birth town
1. Current town
1. Website performance
1. Instruction clarity
1. Internet speed
1. Microphone type
1. Microphone model

For programming reasons it might be best to roll the above questions into one page and have it be the first one.

questions that are asked of those that have variable partner RT:
1. How fast did your partner click? 1-7
1. Did your partner fail to provide a response? 1-100
1. Did your partner responde before you finished speaking? 1-100
1. Did your partner respond before you started speaking? 1-100
1. How much delay was there between you speaking and your partner hearing? 1-7

questions that are asked of those that have feedback:
1. How accurate was your partner? 1-7
1. How often did your partner make a mistake? 1-100

These upper two can be on one page with the feedback ones being if statement'd in

These last two parts should be split across two pages and be the end of the survey
questions that are related to the partner:
1. Did you notice anything weird about the experiment?
1. Did you notice anything weird about your partner?
1. If we told you that some people got randomly paired with an actual partner and some were randomly paird with a computer, what would you say about your partner?
1. after debrief
  1. Was the cover story believable?
  1. Did the experiment make it seem like you were interacting with a partner?
  1. If you realized your partner was a computer, how did you discover it?

pg1 = demographics/accent/microphone
pg2 = partner RT and accuracy
pg3 = weirdness
pg4 = computer or not computer
pg5 = debrief/believability

# misc #
1. attribute the noun project and authors:
  1. Network designed by Stephen Boak from The Noun Project
  2. Headphones from The Noun Project
1. clean up any parts of the code that may speed up functionality
1. the method that advances the last trial in a list to the next part of the webpage is _super hacky_ and should be corrected
1. the server, once in a while, spits out some baroquely described errors that may be important to work out, could just be related to reloading the page
