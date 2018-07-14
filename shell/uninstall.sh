#!/bin/sh

res='fail'

mod_name='clamav'

/raid/data/module/cfg/module.rc/"$mod_name.rc" stop

/opt/bin/sqlite /raid/data/module/cfg/module.db "delete from module where name = '$mod_name'"
/opt/bin/sqlite /raid/data/module/cfg/module.db "delete from mod where module = '$mod_name'"
cd /raid/data/module/cfg/

rm -rf "/raid/data/module/cfg/module.rc/$mod_name.rc"
rm -rf "/raid/data/module/$mod_name"

res='pass'

echo $res
