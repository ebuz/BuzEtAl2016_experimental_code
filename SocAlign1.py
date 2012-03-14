#!/usr/bin/env python

#Author: Andrew Watts
#
#    Copyright 2009-2011 Andrew Watts and
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
import cPickle
import ConfigParser
import os.path
from hashlib import sha224
from webob import Request, Response
from webob.exc import HTTPForbidden, HTTPBadRequest
from jinja2 import Environment, FileSystemLoader
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from models import Worker, TrialList

basepath = os.path.dirname(__file__)

cfg = ConfigParser.SafeConfigParser({'domain': '127.0.0.1'})
cfg.read(os.path.join(basepath, 'expt.cfg'))
engine_string = cfg.get('db', 'engine_string')

formtype = cfg.get('form', 'type').strip("'")

# read in the stimuli via cPickle.
stims = []
with open(os.path.join(basepath,'stims.pickle'),'r') as p:
    stims = cPickle.load(p)

def check_worker_exists(workerid, session):
    try:
        worker = session.query(Worker).filter_by(workerid = workerid).one()
        return worker
    except NoResultFound:
        worker = Worker(workerid = workerid, triallist = random_lowest_list(session))
        session.add(worker)
        session.commit()
        return worker

def random_lowest_list(session):
    all_lists = session.query(TrialList).all()
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

def shuffle_filter(value):
    shuffle(value)
    return value

class SocAlign1Server(object):
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

        currlist, soundtrials, pictrials = [[] for x in range(3)]
        if worker:
            if (debug and forcelist):
                listid = forcelist
            else:
                listid = worker.triallist.number
            currlist = [x for x in stims if int(x['List']) == listid]
            soundtrials = [y for y in currlist if y['TrialType'] == 'EXPOSURE']
            pictrials = [z for z in currlist if z['TrialType'] == 'TEST']
            # cond is same for all pictrials in a list; grab from 1st
            condition = pictrials[0]['ExposureCondition']
            survey = pictrials[0]['SurveyList']

        amz_dict['hash'] = sha224("{}{}{}".format(req.params['workerId'],
                                                  req.params['hitId'],
                                                  req.params['assignmentId'])).hexdigest()

        template = env.get_template('socalign1.html')
        t = template.render(soundfile = soundtrials[0], #only one sound file
            pictrials = pictrials,
            amz = amz_dict,
            listid = listid,
            survey = survey,
            condition = condition,
            formtype = formtype,
            debugmode = 1 if debug else 0,
            # on preview, don't bother loading heavy flash assets
            preview = in_preview)

        resp = Response()
        resp.content_type='text/html'
        resp.unicode_body = t
        domain = cfg.get('host', 'domain')
        # set a cookie that lives 2 hours
        resp.set_cookie('turkrecord', amz_dict['hash'], max_age=7200, path='/', domain=domain, secure=False)
        return resp(environ, start_response)

if __name__ == '__main__':
    import os
    from paste import httpserver, fileapp, urlmap

    app = urlmap.URLMap()
    app['/mturk/stimuli/socalign1'] = fileapp.DirectoryApp(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'stimuli'))
    app['/mturk/img'] = fileapp.DirectoryApp(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'img'))
    app['/iso8601shim.min.js'] = fileapp.FileApp('iso8601shim.min.js')
    app['/mturk/recorder.js'] = fileapp.FileApp('recorder.js')
    app['/mturk/wami-helpers.js'] = fileapp.FileApp('wami-helpers.js')
    app['/mturk/socalign1.js'] = fileapp.FileApp('socalign1.js')
    app['/mturk/modernizr.audioonly.js'] = fileapp.FileApp('modernizr.audioonly.js')
    app['/mturk/modernizr.audiocanvas.js'] = fileapp.FileApp('modernizr.audiocanvas.js')
    app['/mturk/excanvas.js'] = fileapp.FileApp('excanvas.js')
    app['/Wami.swf'] = fileapp.FileApp('Wami.swf')
    app['/expt'] = SocAlign1Server(app)
    httpserver.serve(app, host='127.0.0.1', port=8080)
