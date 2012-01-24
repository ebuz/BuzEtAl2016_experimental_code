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

from __future__ import print_function

import cPickle
from jinja2 import Environment, FileSystemLoader

amz = { # temporary for testing
    'workerid': '',
    'assignmentid': '',
    'hitid': ''
    }

MAXLIST = 12 # highest list number
env = Environment(loader=FileSystemLoader('templates'))
template = env.get_template('socalign1.html')

stims = []
with open(os.path.join(basepath,'stims.pickle'),'r') as p:
    stims = cPickle.load(p)

for i in range(1,MAXLIST+1):
    with open('list{0}.html'.format(i),'w') as listfile:
        currlist = [x for x in stims if int(x['List']) == i]
        soundtrials = [y for y in currlist if y['TrialType'] == 'EXPOSURE']
        pictrials = [z for z in currlist if z['TrialType'] == 'TEST']
        print(template.render(soundtrials = soundtrials,
                              pictrials = pictrials,
                              amz = amz,
                              listid = i,
                        # on preview, don't bother loading heavy flash assets
                              preview = False), file = listfile)
