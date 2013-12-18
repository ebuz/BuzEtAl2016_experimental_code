#! /usr/bin/env python
import sys, logging, csv, argparse

PROG_NAME = 'parse_results'
PARSER = argparse.ArgumentParser(prog=PROG_NAME, description = 'Parse the results file of the Baese-Berk & Goldrick replication study experiment.')

LOG_LEVELS = {'debug':logging.DEBUG, 'info':logging.INFO, 'warning':logging.WARNING, 'error':logging.ERROR, 'critical':logging.CRITICAL}
PARSER.add_argument('--logging_level', choices = LOG_LEVELS, default='debug')
PARSER.add_argument('infile', nargs='?', type=argparse.FileType('r'), default=sys.stdin)
PARSER.add_argument('outfile', nargs='?', type=argparse.FileType('w'), default=sys.stdout)

TRIAL_FIELDS = ['words_up', 'targetposition', 'record_start', 'record_end', 'partnerfeedback', 'timer_stop', 'partnerresponsetime', 'cue_up', 'partnerresponse']

ADDED_FIELDS = ['trial_id', 'trial_type', 'context_condition', 'target_word', 'item_number', 'trial_number', 'feedback_condition', 'partner_response']

# trial_id meaning
# 0 = list_number
# 1 = trial_type
# 2 = context_condition
# 3 = target_word
# 4 = item_number
# 5 = trial_number
# 6 = feedback_condition
# 7 = partner_response

def main(argv=None):
  if argv is None:
    argv = sys.argv
    argv.pop(0)
  args = PARSER.parse_args(argv)
  logging.basicConfig(filename = PROG_NAME + '.log', filemode='w', level=LOG_LEVELS[args.logging_level])
  logging.debug('Arguments given: {!s}'.format(args))
  raw_results = csv.DictReader(args.infile, dialect='excel-tab')
  mturk_added_fields = [f for f in raw_results.fieldnames if not f.startswith('Answer')]
  rest = [f for f in raw_results.fieldnames if f.startswith('Answer')]
  trial_data_fields = [f for f in rest if True in [i in f for i in TRIAL_FIELDS]]
  raw_survey_fields = [f for f in rest if True not in [i in f for i in TRIAL_FIELDS]]
  raw_survey_fields = [f for f in raw_survey_fields if True not in [f.startswith('Answer.'+str(i)+'.') for i in range(1,13)]]
  clean_survey_fields = [f[7:] for f in raw_survey_fields]
  survey_dict = dict(zip(raw_survey_fields, clean_survey_fields))
  output_fields = mturk_added_fields + clean_survey_fields + TRIAL_FIELDS + ADDED_FIELDS
  logging.debug('Data fields: {}'.format(output_fields))
  parsed_results = []
  for r in raw_results:
    participant_info_template = dict()
    trials_data = dict()
    for k in mturk_added_fields:
      participant_info_template[k] = r[k]
    for k in raw_survey_fields:
      participant_info_template[survey_dict[k]] = r[k]
    for k in trial_data_fields:
      if r[k] == '' or r[k] is None:
        continue
      field = [f for f in TRIAL_FIELDS if k[7:].startswith(f)][0]
      trial_id = k[7:].replace(field, '')
      trial_id = trial_id[1:]
      if trial_id in trials_data:
        trials_data[trial_id][field] = r[k]
      else:
        trial_details = participant_info_template.copy()
        trial_details[field] = r[k]
        trial_details['trial_id'] = trial_id
        td = trial_id.split('.')
        trial_details['trial_type'] = td[1]
        trial_details['context_condition'] = td[2]
        trial_details['target_word'] = td[3]
        trial_details['item_number'] = td[4]
        trial_details['trial_number'] = td[5]
        trial_details['feedback_condition'] = td[6]
        trial_details['partner_response'] = td[7]
        trials_data[trial_id] = trial_details
    parsed_results.append(trials_data)
  output_results = csv.DictWriter(args.outfile, dialect='excel-tab', fieldnames = output_fields)
  output_results.writeheader()
  for trials_data in parsed_results:
    output_results.writerows([trials_data[k] for k in trials_data])

if __name__ == '__main__':
  main()
