#/bin/sh
res='fail'
mod_name=$1
mod_enable=$2

opath=`pwd`


if [ $mod_enable = 'No' ];then
    /raid/data/module/cfg/module.rc/"$mod_name.rc" start > /dev/null 2>&1
    if [ $? -eq 0 ];then
        res='pass'
    fi
elif [ $mod_enable = 'Yes' ];then
    /raid/data/module/cfg/module.rc/"$mod_name.rc" stop > /dev/null 2>&1
    if [ $? -eq 0 ];then
        res='pass'
    fi
fi
cd $opath
echo $res
