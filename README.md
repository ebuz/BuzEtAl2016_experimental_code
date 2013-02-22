# SocAlign1 #

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

Make a directory called "stimuli" and copy all the stimuli for the experiment
into it. Run the command `db_init.py` to create the test SQLite database. Copy 
"example.cfg" to "expt.cfg" and edit as necessary.

If you run the command `python SocAlign1.py`, Paste will serve the 
experiment at <http://127.0.0.1:8080/mturk/experiments/socalign1> Be sure to 
pass it 'assignmentId', 'hitId', and 'workerId' parameters. Use whatever values
you want for testing. These are the parameters that MTurk will pass the script.
 If you pass the additional parameter of  "debug=1", then the rendered version
 of the page will allow you to reset your place in the experiment when you 
resume, and there will be controls on the audio file, allowing you to scrub 
through quickly instead of listening to the whole thing. If you set the value 
of 'assignmentId' to 'ASSIGNMENT\_ID\_NOT\_AVAILABLE', it will serve the 
preview version of the experiment a worker browsing on MTurk would see instead 
of the real thing.

To make it work, you also need to run a copy of WavUploader. If you check out a
copy of it and run `python wavuploader.py`, it will serve at 
<http://127.0.0.1:8181/wav_uploader>

### Apache ###
Make a socalign1.wsgi file like this:

    :::python
    import sys
    
    path = '/usr/local/mturk-apps/socalign1'
    if path not in sys.path:
        sys.path.append(path)
    import SocAlign1
    
    application = SocAlign1.SocAlign1Server()

assuming that you plan to put your MTurk experiment WSGIs in /usr/local/mturk-apps/
Make a similar one for WavUploader.

In your Apache config add something like this:

    WSGIScriptAliasMatch ^/mturk/experiments/([^/]+) /usr/local/mturk/$1.wsgi

assuming that you put the WSGI files in /usr/local/mturk/

Copy the files from Wami, Modernizr, and Explorer Canvas to the /mturk/ 
directory under your Apache document root. Make subdirectories called "img" and
"stimuli" copy the contents of the same directories from the test server.

Again, copy "example.cfg" to "expt.cfg" and edit as necessary, but to match 
your Apache setup instead.
