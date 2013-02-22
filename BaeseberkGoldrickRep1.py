#!/usr/bin/env python

#Author: Andrew Watts
#
#    Copyright 2009-2012 Andrew Watts and
#        the University of Rochester BCS Department
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License version 2.1 as
#    published by the Free Software Foundation.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public License
#    along with this program.
#    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
#

from random import choice, shuffle
import sys
import cPickle
import ConfigParser
import os.path
from hashlib import sha224
from datetime import datetime
from webob import Request, Response
from webob.exc import HTTPForbidden, HTTPBadRequest
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from simplejson import loads, dumps
from models import Worker, TrialList

basepath = os.path.dirname(__file__)

cfg = ConfigParser.SafeConfigParser({'domain': '127.0.0.1', 'port': '', 'path': 'wav_uploader'})
cfg.read(os.path.join(basepath, 'expt.cfg'))
engine_string = cfg.get('db', 'engine_string')

formtype = cfg.get('form', 'type')

domain = cfg.get('host', 'domain')
port = cfg.get('host', 'port')
urlpath = cfg.get('host', 'path')

# read in the stimuli via cPickle.
stims = []
with open(os.path.join(basepath,'stims.pickle'),'r') as p:
    stims = cPickle.load(p)

oldworkers = []
try:
  with open(os.path.join(basepath,'oldworkers.pickle'),'r') as p2:
      oldworkers = cPickle.load(p2)
except IOError:
  pass

def check_worker_exists(workerid, session):
    try:
        worker = session.query(Worker).filter_by(workerid = workerid).one()
        return worker
    except NoResultFound:
        worker = Worker(workerid = workerid, triallist = random_lowest_list(session))
        #worker = Worker(workerid = workerid, triallist = static_list(session, 25))
        session.add(worker)
        session.commit()
        return worker

def random_lowest_list(session):
    all_lists = session.query(TrialList).all()
    # Starting by piloting lists NATACC.GOV.LEFT.DO and NATACC.GOV.LEFT.PO, aka 1 and 3
    #all_lists = session.query(TrialList).filter(TrialList.number.in_([1,3])).all()
    #target_lists = range(1,3) # we don't want list 25, which has no sound (aka 'EXPOSURE') trial
    #all_lists = session.query(TrialList).filter(TrialList.number.in_(target_lists)).all()
    # sort the lists from least assigned workers to most
    all_lists.sort(key = lambda x: len(x.workers))

    # if the lists are all the same length return a random one
    if len(all_lists[0].workers) == len(all_lists[-1].workers):
        return choice(all_lists)
    else:
        wk = [len(i.workers) for i in all_lists]
        # find out how many lists are the same length as the smallest
        # and return a random one from that subset
        return choice(all_lists[0:wk.count(wk[0])])

def static_list(session, listno):
    return session.query(TrialList).filter(TrialList.number == listno).one()

def shuffle_filter(value):
    shuffle(value)
    return value

class BaeseberkGoldrickRep1Server(object):
    """
    WSGI compatible class to dispatch pages for the experiment
    """

    def __init__(self, app=None):
        # this way if running standalone, gets app, else doesn't need it
        self.app = app

    def __call__(self, environ, start_response):

        # SQLAlchemy boilerplate code to connect to db and connect models to db objects
        engine = create_engine(engine_string)
        Session = sessionmaker(bind=engine)
        session = Session()

        req = Request(environ)

        if req.is_xhr:
            if not req.method == 'POST':
                raise HTTPMethodNotAllowed("Only POST allowed", allowed='POST')

            if not req.params.has_key('WorkerId'):
                raise HTTPBadRequest('Missing key: WorkerId')

            worker = None
            try:
                worker = session.query(Worker).filter_by(workerid = req.params['WorkerId']).one()
            except NoResultFound:
                raise HTTPBadRequest('Worker {} does not exist'.format(req.params['WorkerId']))

            if req.params.has_key('ItemNumber'):
                worker.lastseen = datetime.now()
                worker.lastitem = req.params['ItemNumber']
                #print("Setting {} to {} at {}".format(worker.workerid, worker.lastitem, worker.lastseen))

            if req.params.has_key('Abandoned'):
                if req.params['Abandoned'] == "true":
                    worker.abandoned = True
                    #print("{} has abandoned the hit".format(worker.workerid))
                else:
                    worker.abandoned = False

            session.commit()

            resp = Response(charset='utf8')
            resp.content_type = 'application/json'
            resp.text = unicode(dumps({'timestamp': worker.lastseen.isoformat(), 'item': worker.lastitem}))
            return resp(environ, start_response)
        else:
            env = Environment(loader=FileSystemLoader(os.path.join(basepath,'templates')))
            env.filters['shuffle'] = shuffle_filter
            amz_dict = {'workerId': '', 'assignmentId': '', 'hitId': ''}
            templ, listid, condition, template, resp = [None for x in range(5)]
            required_keys = ['assignmentId', 'hitId']
            key_error_msg = 'Missing parameter: {0}. Required keys: {1}'

            debug = False
            if req.params.has_key('debug'):
                debug = True if req.params['debug'] == '1' else False

            forcelist = None
            if req.params.has_key('list'):
                forcelist = int(req.params['list'])

            try:
                amz_dict['assignmentId'] = req.params['assignmentId']
                amz_dict['hitId'] = req.params['hitId']
            except KeyError as e:
                resp = HTTPBadRequest(key_error_msg.format(e, required_keys))
                return resp(environ, start_response)

            in_preview = True if amz_dict['assignmentId'] == 'ASSIGNMENT_ID_NOT_AVAILABLE' else False

            worker = None
            if not in_preview:
                try:
                    amz_dict['workerId'] = req.params['workerId']
                except KeyError as e:
                    required_keys.append('workerId')
                    resp = HTTPBadRequest(key_error_msg.format(e, required_keys))
                    return resp(environ, start_response)
                worker = check_worker_exists(amz_dict['workerId'], session)

                amz_dict['hash'] = sha224("{}{}{}".format(req.params['workerId'],
                                                      req.params['hitId'],
                                                      req.params['assignmentId'])).hexdigest()

            currlist = [[] for x in range(1)]
            feedbackcondition, responsetimetype, experimentname, survey = None, None, None, None
            if worker:
                if (debug and forcelist is not None):
                    listid = forcelist
                else:
                    listid = worker.triallist.number
                currlist = [x for x in stims if int(x['ListID']) == listid]
                testtrials = [z for z in currlist if z['TrialType'] == 'TEST']
                survey = testtrials[0]['SurveyList']
                experimentname = testtrials[0]['ExperimentName']
                feedbackcondition = testtrials[0]['PartnerFeedbackType']
                responsetimetype = 0 if testtrials[0]['PartnerResponseTime'] == '-1' else 1
            else:
                pass

            recorder_url = 'http://' + domain
            if port != '':
                recorder_url += ':' + port
            recorder_url += '/' + urlpath

            t = None
            if (type(worker) != type(None) and worker.workerid in oldworkers):
                template = env.get_template('sorry.html')
                t = template.render()
            else:
                startitem = 0
                if (type(worker) != type(None)):
                    startitem = worker.lastitem
                template = env.get_template('baese-berk_goldrick_rep1.html')
                t = template.render(
                    testtrials = testtrials,
                    amz = amz_dict,
                    listid = listid,
                    feedbackcondition = feedbackcondition,
                    responsetimetype = responsetimetype,
                    survey = survey,
                    experimentname = experimentname,
                    formtype = formtype,
                    recorder_url = recorder_url,
                    debugmode = 1 if debug else 0,
                    startitem = startitem,
                    # on preview, don't bother loading heavy flash assets
                    preview = in_preview)

            resp = Response()
            resp.content_type='text/html'
            resp.unicode_body = t
            return resp(environ, start_response)

if __name__ == '__main__':
    import os
    from paste import httpserver, fileapp, urlmap

    app = urlmap.URLMap()
    app['/mturk/stimuli/baese-berk_goldrick_rep1'] = fileapp.DirectoryApp(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'stimuli'))
    app['/mturk/img'] = fileapp.DirectoryApp(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'img'))
    app['/mturk/iso8601shim.min.js'] = fileapp.FileApp('iso8601shim.min.js')
    app['/mturk/jquery.timers-1.2.js'] = fileapp.FileApp('jquery.timers-1.2.js')
    app['/mturk/recorder.js'] = fileapp.FileApp('recorder.js')
    app['/mturk/wami-helpers.js'] = fileapp.FileApp('wami-helpers.js')
    app['/mturk/baese-berk_goldrick_rep1.js'] = fileapp.FileApp('baese-berk_goldrick_rep1.js')
    #app['/mturk/modernizr.audioonly.js'] = fileapp.FileApp('modernizr.audioonly.js')
    app['/mturk/modernizr.audiocanvas.js'] = fileapp.FileApp('modernizr.audiocanvas.js')
    #app['/mturk/modernizr.canvas.js'] = fileapp.FileApp('modernizr.canvas.js')
    app['/mturk/excanvas.js'] = fileapp.FileApp('excanvas.js')
    app['/mturk/experiments/Wami.swf'] = fileapp.FileApp('Wami.swf')
    app['/mturk/experiments/baese-berk_goldrick_rep1'] = BaeseberkGoldrickRep1Server(app)
    httpserver.serve(app, host='127.0.0.1', port=8080)
