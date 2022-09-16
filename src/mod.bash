#!/bin/bash

chr="\""
file="canadian_words.txt"
cp $file $file."_backup"
while read -r line
do
 echo "${chr}$line${chr}",
done <$file > newfile
mv newfile $file

