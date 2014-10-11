# baese-berk_goldrick_rep1 #

## External Python dependancies: ##
All of these should be installable with [easy\_install or pip](http://pythonhosted.org/distribute/)

* [WebOb](http://webob.org/)
* [Paste](http://pythonpaste.org/)
* [Jinja2](http://jinja.pocoo.org/)
* [SQLAlchemy](http://www.sqlalchemy.org/)
* [SimpleJSON](https://github.com/simplejson/simplejson)

## External JS dependencies: ##
* [Explorer canvas](http://code.google.com/p/explorercanvas/)
* [Modernizr](http://modernizr.com/)
* [jQuery Timers](http://archive.plugins.jquery.com/project/timers)

## Other external dependencies: ##
* [WavUploader](https://bitbucket.org/hlplab/wavuploader)
* [Wami Recorder](http://code.google.com/p/wami-recorder/)
* [Mod WSGI](http://code.google.com/p/modwsgi/) - I think this should be a part
of a standard Apache install these days and just need to be enabled.

## Setup ##

### Local Test Server ###
Make sure you have the latest version of WAMI Recorder checked out and copy 
the "Wami.swf" and "recorder.js" files into the socalign1 directory so Paste 
can serve them. Also make a customized version of the current version of 
Modernizr that includes checks for audio and canvas; call it 
"modernizr.audiocanvas.js". Grab the most recent Explorer Canvas JS file as 
well, so you can support canvas on IE < 9.

Run the command `db_init.py` to create the test SQLite database.

If you run the command `python BaeseberkGoldrickRep1.py`, Paste will serve the 
experiment at <http://127.0.0.1:8080/mturk/experiments/interactive_communication1> Be sure to 
pass it 'assignmentId', 'hitId', and 'workerId' parameters. Use whatever values
you want for testing. These are the parameters that MTurk will pass the script.
 If you pass the additional parameter of  "debug=1", then the rendered version
 of the page will allow you to reset your place in the experiment and allow you to
 skip over some of the hardcoded wait times. If you set the value 
of 'assignmentId' to 'ASSIGNMENT\_ID\_NOT\_AVAILABLE', it will serve the 
preview version of the experiment a worker browsing on MTurk would see instead 
of the real thing.

To make it work, you also need to run a copy of WavUploader. If you check out a
copy of it and run `python wavuploader.py`, it will serve at 
<http://127.0.0.1:8181/wav_uploader>
