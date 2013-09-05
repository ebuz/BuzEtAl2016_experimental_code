#! /usr/bin/env python
import sys, logging, csv, argparse

PROG_NAME = 'parse_results'
PARSER = argparse.ArgumentParser(prog=PROG_NAME, description = 'Parse the results file of the Baese-Berk & Goldrick replication study experiment.')

LOG_LEVELS = {'debug':logging.DEBUG, 'info':logging.INFO, 'warning':logging.WARNING, 'error':logging.ERROR, 'critical':logging.CRITICAL}
PARSER.add_argument('--logging_level', choices = LOG_LEVELS, default='debug')
PARSER.add_argument('infile', nargs='?', type=argparse.FileType('r'), default=sys.stdin)
PARSER.add_argument('outfile', nargs='?', type=argparse.FileType('w'), default=sys.stdout)
PARSER.add_argument("DON'T USE THIS PROGRAM YET", nargs=99, required=True, help="this program needs to be overhauled like crazy.")

TRIAL_FIELDS = ['list', 'trial_number', 'trial_type', 'recording_participant', 'recording_trial', 'recording_pair', 'recording_pair_position', 'word_density', 'word', 'target_picture_position']

def main(argv=None):
  if argv is None:
    argv = sys.argv
    argv.pop(0)
  args = PARSER.parse_args(argv)
  logging.basicConfig(filename = PROG_NAME + '.log', filemode='w', level=LOG_LEVELS[args.logging_level])
  logging.debug('Arguments given: {!s}'.format(args))
  raw_results = csv.DictReader(args.infile, dialect='excel-tab')
  output_fields = [x for x in raw_results.fieldnames if not x.startswith('Answer.')]
  output_fields.extend([x[7:] for x in raw_results.fieldnames if x.startswith('Answer.') and '_' not in x])
  output_fields.extend(set([x.split('_')[0][7:] for x in raw_results.fieldnames if x.startswith('Answer.') and '_' in x]))
  output_fields.extend(TRIAL_FIELDS)
  logging.debug('Data fields: {}'.format(output_fields))
  parsed_results = []
  trial_results = dict()
  for r in raw_results:
    participant_template = dict()
    for k in r:
      if 'Answer.' not in k:
        participant_template[k] = r[k]
      elif '_' not in k:
        participant_template[k[7:]] = r[k]
    for k in [x for x in r if 'Answer.' in x and '_' in x]:
      if r[k] == '' or r[k] is None:
        continue
      trial_details = dict(zip(TRIAL_FIELDS, k.split('_')[1].split('.')))
      trial_key = (r['workerid'], trial_details['trial_type'], trial_details['trial_number'])
      if trial_key in trial_results:
        trial_d = trial_results[trial_key]
      else:
        trial_d = participant_template.copy()
        trial_d.update(trial_details)
        trial_results[trial_key] = trial_d
      trial_d[k[7:].split('_')[0]] = r[k]
  output_results = csv.DictWriter(args.outfile, dialect='excel-tab', fieldnames = output_fields)
  output_results.writeheader()
  trial_keys = [k for k in trial_results]
  output_results.writerows([trial_results[k] for k in sorted(trial_keys, key=lambda k: (k[0], k[1], int(k[2])))])


if __name__ == '__main__':
  main()
