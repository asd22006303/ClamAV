#!/bin/sh

res='fail'

mod_name='clamav'

if [ -f "/raid/data/module/$mod_name/system/virus.db" ];then
    cp "/raid/data/module/$mod_name/system/virus.db" "/raid/data/tmp/module/System/virus.db"
fi

mkdir "/raid/data/module/cfg/"               > /dev/null 2>&1
mkdir "/raid/data/module/cfg/module.rc/"     > /dev/null 2>&1
mkdir "/raid/data/module/$mod_name/"         > /dev/null 2>&1
mkdir "/raid/data/module/$mod_name/shell/"   > /dev/null 2>&1
mkdir "/raid/data/module/$mod_name/www/"     > /dev/null 2>&1
mkdir "/raid/data/module/$mod_name/system/"  > /dev/null 2>&1
mkdir "/raid/data/module/$mod_name/COPY"        > /dev/null 2>&1

cp -f   /raid/data/tmp/module/Shell/module.rc             "/raid/data/module/cfg/module.rc/$mod_name.rc"       > /dev/null 2>&1
cp -rf  /raid/data/tmp/module/Shell/*                     "/raid/data/module/$mod_name/shell"                  > /dev/null 2>&1
cp -rf  /raid/data/tmp/module/WWW/*                       "/raid/data/module/$mod_name/www"                    > /dev/null 2>&1
cp -rf  /raid/data/tmp/module/System/*                    "/raid/data/module/$mod_name/system"                    > /dev/null 2>&1
cp -f   /raid/data/tmp/module/Configure/license.txt     "/raid/data/module/$mod_name/COPY"                      > /dev/null 2>&1

res='pass'

echo $res

