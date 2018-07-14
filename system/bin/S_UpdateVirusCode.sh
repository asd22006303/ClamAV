#!/bin/sh
#crond_conf="/etc/crontab"
crond_conf="/var/spool/cron/crontabs/louis_server"
SQLITE="/opt/bin/sqlite"
tmp_crond_conf="/tmp/tmp_crond_conf"
Virus_db="/raid/data/module/clamav/system/virus.db"
eg1p="/raid/data/module/clamav/system/bin/UpdateVirusCode.sh"
on_eg1=`sudo cat ${crond_conf} | grep ${eg1p}| /usr/bin/wc -l`
if [ "${on_eg1}" -gt 0 ];
  then
      sudo cat ${crond_conf} | grep -v ${eg1p} > ${tmp_crond_conf}
      sudo mv  ${tmp_crond_conf} ${crond_conf}
fi
fileinfo=`$SQLITE $Virus_db "select * from updater"`
schedule=`echo $fileinfo|awk -F'|' '{print $3}'`
type=`echo $fileinfo|awk -F'|' '{print $4}'`
starttime=`echo $fileinfo|awk -F'|' '{print $5}'`
week=`echo $fileinfo|awk -F'|' '{print $6}'`
PM_D=`echo $starttime|grep "PM"|/usr/bin/wc -l`
starttime=`echo $starttime|sed 's/PM//g'|sed 's/AM//g'`
starttimeH=""
starttimeM=""
if [ "$starttime" != "" ];then
      starttimeH=`echo $starttime|awk -F':' '{print $1}'`
      if [ "${PM_D}" -gt 0 ];then
         if  [ "$starttimeH" != "12" ];then
              starttimeH=$((starttimeH+12))
         fi     
        else
         if  [ "$starttimeH" == "12" ];then
              starttimeH=$((starttimeH-12))
         fi
      fi
      starttimeM=`echo $starttime|awk -F':' '{print $2}'`
      starttimeM=`echo $starttimeM`
fi
if [ "$schedule" == "1" ];then
     sudo mv ${crond_conf} ${tmp_crond_conf}
     if [ "$type" == "1" ];then
         echo "$starttimeM $starttimeH * * * ${eg1p} > /dev/null 2>&1" >> ${tmp_crond_conf}
     else
         if [ "$type" == "2" ];then
             echo "$starttimeM $starttimeH * * $week ${eg1p} > /dev/null 2>&1" >> ${tmp_crond_conf}
         fi
     fi
     sudo mv ${tmp_crond_conf} ${crond_conf}
fi
sudo cat ${crond_conf} | crontab - -u root
if [ "$1" == "0" -a "$2" == "now" ];then
   sh ${eg1p} > /dev/null 2>&1
fi
