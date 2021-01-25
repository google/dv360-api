#! /bin/bash

output_file=all-in-one.js.txt
file_extension="*.gs"

echo > $output_file
for f in $(find . -iname "${file_extension}"); do
    echo "/* START File: $f */" >> $output_file
    cat $f >> $output_file
    echo "/* END File: $f */" >> $output_file
done