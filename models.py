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
Modified from the database models for Kathryn Campbell-Kibler, Kodi Weatherholtz,
and T. Florian Jaeger's experiment. Based onCamber Hansen-Karr's EmoPrm1 experiment
Modifications by Esteban Buz <esteban.buz@gmail.com>
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base, declared_attr
import datetime

Base = declarative_base()

class MyMixin(object):

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    __table_args__ = {'mysql_engine': 'InnoDB', 'mysql_charset': 'utf8'}

    id =  Column(Integer, primary_key=True)

class Worker(Base, MyMixin):
    """
    Representation of an mturk worker and what list they were assigned to
    """

    __tablename__ = 'worker'

    workerid = Column(String(32), unique=True)
    abandoned = Column(Boolean, default = False)
    finished_trials = Column(Boolean, default = False)
    finished_survey = Column(Boolean, default = False)
    finished_hit = Column(Boolean, default = False)
    lastitem = Column(Integer, default = 0)
    firstseen = Column(DateTime, default = datetime.datetime.now, nullable = False)
    lastseen = Column(DateTime, default = datetime.datetime.now, nullable = False)
    list_id = Column(Integer, ForeignKey('triallist.id'))
    triallist = relationship('TrialList', backref = 'workers')

    def __repr__(self):
        return '<Worker: "%s">' % (self.workerid)

class TrialList(Base, MyMixin):
    """
    Which list workers are on
    """

    __tablename__ = 'triallist'

    number = Column(Integer)

    def __repr__(self):
        return '<TrialGroup: "%d">' % (self.number)

    @property
    def active_workers(self):
        return filter(lambda x: x.abandoned == False, self.workers)
