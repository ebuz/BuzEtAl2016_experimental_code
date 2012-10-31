#!/usr/bin/env python

# Author: Andrew Watts
#
#
#    Copyright 2012 Andrew Watts and the University of Rochester
#    BCS Department
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Lesser General Public License version
#    2.1 as published by the Free Software Foundation.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Lesser General Public License for more details.
#
#    You should have received a copy of the GNU Lesser General Public
#    License along with this program.
#    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.

"""
Takes the Mechanical Turk results file as provided by the AWS CLT getResults.sh
script and strips off the 'Answer.' from the non-Amazon field names. Also 
ignores some timing related fields accidentally left over from older 
experiments this is based on.
"""

from csv import DictReader, DictWriter

origresults = []
with open('mturk/socalign1.results.csv', 'r') as origfile:
    origresults = list(DictReader(origfile, delimiter='\t'))

turkfields = ['hitid', 'hittypeid', 'title', 'description', 'keywords',
                  'reward', 'creationtime', 'assignments', 'numavailable',
                  'numpending', 'numcomplete', 'hitstatus', 'reviewstatus',
                  'annotation', 'assignmentduration', 'autoapprovaldelay',
                  'hitlifetime', 'viewhit', 'assignmentid', 'workerid',
                  'assignmentstatus', 'autoapprovaltime', 'assignmentaccepttime',
                  'assignmentsubmittime', 'assignmentapprovaltime',
                  'assignmentrejecttime', 'deadline', 'feedback', 'reject']

hlpfields = ['experiment', 'ExposureCondition', 'List', 'comment', 'browserid']

questionfields = ['q.speaker.conservative',
 'q.speaker.liberal',
 'q.speaker.articulate',
 'q.speaker.accented',
 'q.speaker.intelligent',
 'q.speaker.educated',
 'q.speaker.self-centered',
 'q.speaker.generous',
 'q.speaker.weak_arguments',
 'q.speaker.shy',
 'q.speaker.enthusiastic',
 'q.speaker.easy_to_understand',
 'q.participant.speaker_speaks_like_me',
 'q.participant.speaker_is_similar_to_me',
 'q.participant.speaker_would_understand_me',
 'q.participant.agree_with_speaker',
 'q.participant.want_speaker_as_friend',
 'q.participant.age',
 'q.participant.gender',
 'q.participant.gender.other',
 'q.participant.education',
 'q.ideology.conservative',
 'q.ideology.liberal',
 'q.ideology.republicans',
 'q.ideology.democrats',
 'q.ideology.enjoy_accents',
 'q.ideology.proper_english',
 'q.ideology.official_language',
 'q.ideology.importance_of_speaking_well',
 'q.ideology.accent_and_self-presentation',
 'q.ideology.accent_predicts_intelligence',
 'q.conflict.dominate.my_way_best',
 'q.conflict.avoid.ignore',
 'q.conflict.integrate.meet_halfway',
 'q.conflict.dominate.insist_my_position_be_accepted',
 'q.conflict.avoid.pretend_nothing_happend',
 'q.conflict.avoid.pretend_no_conflict',
 'q.conflict.integrate.middle_course',
 'q.conflict.dominate.dominate_until_other_understands',
 'q.conflict.integrate.give_and_take']

ourfields = turkfields + hlpfields + questionfields

with open('mturk/socalign1.cleaned.results.csv', 'w') as cleanfile:
    cleanwriter = DictWriter(cleanfile, delimiter='\t', fieldnames=ourfields)
    cleanwriter.writeheader()
    for row in origresults:
        outrow = {}
        for t in turkfields:
            outrow[t] = row[t]
        for h in hlpfields:
            outrow[h] = row['Answer.' + h]
        for q in questionfields:
            outrow[q] = row['Answer.' + q]
        cleanwriter.writerow(outrow)
