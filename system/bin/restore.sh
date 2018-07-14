#!/bin/sh
SQLITE="/opt/bin/sqlite"
DB="/raid/data/module/clamav/system/virus.db"
QPATH="/raid/data/module/clamav/system/quarantine/"
path=`$SQLITE $DB "select path from quarantine where qid='$1'"`
filename=`$SQLITE $DB "select filename from quarantine where qid='$1'"`
mv $QPATH$filename $path
$SQLITE $DB "delete from quarantine where qid='$1'"
