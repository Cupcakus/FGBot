#!/bin/bash
set -e

rm -f pf2statsext.zip
zip -r pf2statsext.zip ./ -x pf2statsext.zip build.sh

if [ -z "${1}" ]; then
    DEST="/mnt/c/Smiteworks/Fantasy Grounds/extensions"
else
    DEST="${1}"
fi

if [ -d "${DEST}" ]; then
    mv pf2statsext.zip "${DEST}/pf2stats.ext"
else
    echo "Destination directory does not seem to exist!"
    rm -f pf2statsext.zip
    exit 1
fi

exit 0