#!/bin/sh
FILENAME="/raid/data/module/clamav/log/scan_$1.log"
AFTER_DETECTION=`sqlite /raid/data/module/clamav/system/virus.db "select handletype from scan where sid='$1'"`
exec < $FILENAME

while read line
do
    EACH_CONTENT_PATH=`echo $line | awk -F':' '/FOUND/{print $1}'`
    if [ "${EACH_CONTENT_PATH}" != "" ];then
        EACH_CONTENT_NAME=`echo "$EACH_CONTENT_PATH" | awk -F'/' '{print $NF}'`
        sqlite /raid/data/module/clamav/system/virus.db "insert into quarantine (sid,filename,path,virusname) values($1,\"$EACH_CONTENT_NAME\",\"$EACH_CONTENT_PATH\",'');"
        if [ ${AFTER_DETECTION} == 0 ];then
            mv "$EACH_CONTENT_PATH" /raid/data/module/clamav/system/quarantine/
        fi
    fi
done

rm -f $FILENAME
