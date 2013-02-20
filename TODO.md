# General changes #
* Scrub the SocAlign1 references
* Figure out why the server spits out bad list numbers (greater than 7)
* Modify instructions and end survey/debrief
* Instructions should reiterate that subjects should be in quiet room with no one else around
* Mention that experiment should be done in one go, and not to wait too long between trials to avoid wasting "partner time"
* Include variable about if the participants finish in time

# Dealing with partner timings #
* Change the instructions such that it presents the pseudo-confederate setup
* Add a set of practice trials, presumably from a generated list

Trials should start like this: a little set of images appears that shows the syncing occuring between speaker and partner, the timing should be variable but not more than 2 seconds. The images dissapear and a fixation cross occurs in the middle of the screen for about 500ms. Then the words appear for about 1000ms. Then the cue is given with: a green box around the word and a little microphone icon. The timer bar appears and counts down from something like 20 seconds, it should be grey. Then feedback occurs. Then the trial stuff goes away and a button to move onto the next trial appears with a countdown timer and message that sends people to the end of the experiment if they take too long.
Things that have to be done to get the current experiment to this point:
1. Add in resync screen for each trial with a much shorter time wait
1. Add in fixation cross prior to word presentation
1. Modify the position stuff of the current stimuli frame so it doesn't bounce around
1. Remove "rec" red dot
1. Add the needed changes to the stimuli to give feedback as outlined in the lower section
1. After the timer or response is made the words should dissapear and instead a message to move on should appear with a countdown timer, ending the timer should send one to a splash screen that they took too long and their partner was disconnected then send them to the survey
1. The above message should have a button to press (also accept space bar) that will advance the trial

# Dealing with feedback #
There needs to be a cohesive way to handle feedback that changes by condition. Ideally there are three kinds of feedback we will use: no feedback, positive feedback, positive and negative feedback.
## no feedback ##
two types:
* the timer bar ends and the trial ends, nothing else
* responses are variable in time, when a response is made the timer bar stops for a brief period, then the trial ends
## positive feedback ##
* the response is only positive: timer bar stops in variable time and a message saying "correct" appears
* the response is only positive: timer bar stops in variable time and the choice of the partner is highlighted
## positive feedback ##
* the response is both positive and negative: timer bar stops in variable time and the participant sees a message of correct or incorrect
* the response is both positive and negative: timer bar stops in variable time and the participant sees the choice of the partner highlighted
