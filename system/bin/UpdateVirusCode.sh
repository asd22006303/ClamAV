#!/bin/sh
SQLITE="/opt/bin/sqlite"
Virus_db="/raid/data/module/clamav/system/virus.db"
BINDIR="/raid/data/module/clamav/system/bin/"
$BINDIR/logevent/event 997 9003 info ""
TMPDIR=/raid/data/module/clamav/system/share/clamav/
UPDATE_SCAN_BINARY=/raid/data/module/clamav/system/bin/freshclam
[ -e $TMPDIR ] && sudo rm -rf $TMPDIR
mkdir $TMPDIR

CLAMAV_USER=`cat /etc/passwd | grep clamav`
OS_VERSION=`cat /etc/version  | awk -F'.' '{print $1}'`
if [ "$CLAMAV_USER" == "" ];then
    if [ "$OS_VERSION" == "3" ];then
`python -c "
from UserManager.User import UserManager
UserManager().create_nas_user('clamav', 'admin', '34', root=True, force_uid=True, home=False)
"`
    elif [ "$OS_VERSION" == "2" ];then
        /bin/adduser -D -u 34 -G users -s /dev/null -h /dev/null -H -g clamav clamav
    fi
fi

chown -R clamav $TMPDIR
$SQLITE $Virus_db "update updater set status=1,lastupdate=DATETIME('NOW','LOCALTIME')"
$UPDATE_SCAN_BINARY

if [ -f $TMPDIR/bytecode.cvd -a -f $TMPDIR/daily.cvd -a -f $TMPDIR/main.cvd -a -f $TMPDIR/mirrors.dat ];then
    $SQLITE $Virus_db "update updater set status=2,lastupdate=DATETIME('NOW','LOCALTIME')"
    $BINDIR/logevent/event 997 9004 info ""
else
   $SQLITE $Virus_db "update updater set status=3"
   $BINDIR/logevent/event 997 9202 error ""
fi

