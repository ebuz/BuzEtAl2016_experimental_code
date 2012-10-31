#!/usr/bin/Rscript
socalign <- read.csv('mturk/socalign1.cleaned.results.csv', sep = '\t')
table(socalign$List)
