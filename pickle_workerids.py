#! /usr/bin/env python

# Author: Esteban Buz <esteban.buz@gmail.com>
#
# Copyright 2013 Esteban Buz and the University of Rochester. All rights
# reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
#   1.  Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#   2.  Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS''
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE FREEBSD PROJECT OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#
# The views and conclusions contained in the software and documentation are
# those of the authors and should not be interpreted as representing official
# policies, either expressed or implied, of the University of Rochester
#

import sys
import logging
import argparse
import os.path
from six.moves import cPickle
from six.moves import configparser
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm.exc import NoResultFound
from models import Worker, TrialList

BASEPATH = os.path.dirname(__file__)
CFG = configparser.SafeConfigParser()
CFG.read(os.path.join(BASEPATH, 'expt.cfg'))
ENGINE_STRING = CFG.get('db', 'engine_string')

PROG_NAME = 'pickle_workerids'
PARSER = argparse.ArgumentParser(prog = PROG_NAME, description = 'Extracts and pickles a list of workerids from the passed .sqlite database.')
PARSER.add_argument('--sqlite_db', default = ENGINE_STRING)
PARSER.add_argument('--old_pickle_file', default = 'oldworkers.pickle')
PARSER.add_argument('--output_file', default = 'oldworkers.pickle')

LOG_LEVELS = {'debug':logging.DEBUG, 'info':logging.INFO, 'warning':logging.WARNING, 'error':logging.ERROR, 'critical':logging.CRITICAL}
PARSER.add_argument('--logging_level', choices = LOG_LEVELS, default='info')

def main(argv=None):
  if argv is None:
    argv = sys.argv[1:]
  args = PARSER.parse_args(argv)
  logging.basicConfig(filename = PROG_NAME + '.log', filemode='w', level=LOG_LEVELS[args.logging_level])
  logging.info('Using the sql database: {}'.format(args.sqlite_db))
  old_workers = set()
  if args.old_pickle_file:
    logging.info('Using the old pickle file: {}'.format(args.old_pickle_file))
    try:
      with open(args.old_pickle_file, 'rb') as p:
        old_workers.update(cPickle.load(p))
        logging.info('Including the following old workers:\n\t{}'.format('\n\t'.join(old_workers)))
    except IOError:
      logging.error('The pickle file provided could not be opened.')
  engine = create_engine(args.sqlite_db)
  Session = sessionmaker(bind=engine)
  session = Session()

  try:
    workers = session.query(Worker).all()
    new_workers = set([x.workerid for x in workers])
    if len(new_workers - old_workers) > 0:
      logging.info('Including the following new workers:\n\t{}'.format('\n\t'.join(new_workers - old_workers)))
    else:
      logging.info('No new workers to include.')
    old_workers = old_workers | new_workers
  except NoResutFound:
    logging.error('The database did not have any workers in it or some other issue occurred while retrieving workers.')

  with open(args.output_file, 'wb') as p:
    cPickle.dump(old_workers, p, cPickle.HIGHEST_PROTOCOL)

if __name__ == '__main__':
  main()
