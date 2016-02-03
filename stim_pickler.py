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

import cPickle
from csv import DictReader
import argparse

PARSER = argparse.ArgumentParser(prog = 'Make easy to load pre-parsed stimulus file', description = 'Extracts and pickles a list of workerids from the passed .sqlite database.')
PARSER.add_argument('-s', '--stimuli_file', default = 'stimuli.csv')

args = PARSER.parse_args()

stims = []
with open(args.stimuli_file, 'rUb') as stimfile:
    stims = list(DictReader(stimfile))

with open('stims.pickle', 'w') as picklefile:
    cPickle.dump(stims, picklefile, cPickle.HIGHEST_PROTOCOL)
