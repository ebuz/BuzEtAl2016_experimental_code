#!/usr/bin/env python

#Author: Andrew Watts
#
#    Copyright 2009-2011 Andrew Watts and the University of Rochester
#    Brain and Cognitive Sciences Department
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

"""
Creates the database, table schemas, and initializes all of the chains and
generations
"""

from models import Worker, TrialList
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import ConfigParser

MAX_LIST = 8

cfg = ConfigParser.SafeConfigParser()
cfg.read('expt.cfg')

engine_string = cfg.get('db', 'engine_string')

engine = create_engine(engine_string)
Session = sessionmaker(bind=engine)

session = Session()

Worker.metadata.create_all(engine)
TrialList.metadata.create_all(engine)

# create our lists
for i in range(1,MAX_LIST+1):
    triallist = TrialList(number = i)
    session.add(triallist)

session.commit()
