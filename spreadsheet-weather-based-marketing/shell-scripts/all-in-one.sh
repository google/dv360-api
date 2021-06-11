#! /bin/bash

output_file=all-in-one.js.txt
file_extension="*.gs"
exclude="./google-ads/*"

echo > $output_file

find=$(find . -iname "${file_extension}" -not -path "${exclude}")
for f in $find; do
    echo "/* START File: $f */" >> $output_file
    cat $f >> $output_file
    echo "/* END File: $f */" >> $output_file
done