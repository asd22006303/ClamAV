#!/bin/sh
crond_conf="/var/spool/cron/crontabs/louis_server"
SQLITE="/opt/bin/sqlite"
tmp_crond_conf="/tmp/tmp_crond_conf"
Virus_db="/raid/data/module/clamav/system/virus.db"
eg1p="/raid/data/module/clamav/system/bin/clamscan"
eg2p="/raid/data/module/clamav/system/bin/VirusScanSchedule.sh"
crontable_handle() {
     on_eg1=`sudo cat ${crond_conf} | grep ${eg1p}| /usr/bin/wc -l`
     if [ "${on_eg1}" -gt 0 ];
       then
            sudo cat ${crond_conf} | grep -v ${eg1p} > ${tmp_crond_conf}
            sudo mv  ${tmp_crond_conf} ${crond_conf}
     fi
     on_eg2=`sudo cat ${crond_conf} | grep ${eg2p}| /usr/bin/wc -l`
     if [ "${on_eg1}" -gt 0 ];
       then
            sudo cat ${crond_conf} | grep -v ${eg2p} > ${tmp_crond_conf}
            sudo mv  ${tmp_crond_conf} ${crond_conf}
     fi
     $SQLITE $Virus_db "select * from scan"| while read file;do
           sid=`echo $file|awk -F'|' '{print $1}'`
           dirfile=`echo $file|awk -F'|' '{print $2}'`
           status=`echo $file|awk -F'|' '{print $4}'`
           type=`echo $file|awk -F'|' '{print $5}'`
           week=`echo $file|awk -F'|' '{print $7}'`
           starttime=`echo $file|awk -F'|' '{print $6}'`
           PM_D=`echo $starttime|grep "PM"|/usr/bin/wc -l`
           starttime_d=`echo $starttime|sed 's/PM//g'|sed 's/AM//g'`
           starttimeH=""
           starttimeM=""
           if [ "$starttime_d" != "" ];then
                 starttimeH=`echo $starttime_d|awk -F':' '{print $1}'`
                 if [ "${PM_D}" -gt 0 ];then
                   if  [ "$starttimeH" != "12" ];then
                        starttimeH=$((starttimeH+12))
                   fi   
                  else
                   if  [ "$starttimeH" == "12" ];then
                        starttimeH=$((starttimeH-12))
                   fi
                 fi
                 starttimeM=`echo $starttime_d|awk -F':' '{print $2}'`
                 starttimeM=`echo $starttimeM`
           fi
           if [ "$type" == "1" ];then
                 datatmpshell="$starttimeM $starttimeH \* \* \* ${eg1p}"
                 on_eg1=`sudo cat ${crond_conf} | grep "$datatmpshell"| /usr/bin/wc -l`
                 if [ "${on_eg1}" -eq 0 ];
                    then
                         pcount=`$SQLITE $Virus_db "select * from scan where starttime='$starttime' and type=$type"|/usr/bin/wc -l`
                         if [ "${pcount}" -gt 0 ];
                            then
                               datastring1=""
                               $SQLITE $Virus_db "select * from scan where starttime='$starttime' and type=$type"| while read file1;do
                                  datatmp1sid=`echo $file1|awk -F'|' '{print $1}'`
                                  datastring1=`echo $file1|awk -F'|' '{print $2}'`
                                  sudo mv ${crond_conf} ${tmp_crond_conf}
                                  sudo chmod 777 ${tmp_crond_conf}
                                  echo "$starttimeM $starttimeH * * * ${eg1p} $EXECUTE_ITEM "/raid/data/module/clamav/log/finish_$datatmp1sid.log" "/home/louis/$datastring1" > /raid/data/module/clamav/log/scan_$datatmp1sid.log 2>&1" >> ${tmp_crond_conf}
                                  sudo mv ${tmp_crond_conf} ${crond_conf}
                               done
                         fi     
                 fi
            else
                 if [ "$type" == "2" ];then
                       datatmpshell="$starttimeM $starttimeH \* \* $week ${eg1p}"
                       on_eg1=`sudo cat ${crond_conf} | grep "$datatmpshell"| /usr/bin/wc -l`
                       if [ "${on_eg1}" -eq 0 ];
                          then
                             pcount=`$SQLITE $Virus_db "select * from scan where starttime='$starttime' and type=$type and week='$week'"|/usr/bin/wc -l`
                             if [ "${pcount}" -gt 0 ];
                                then
                                  datastring2=""
                                  $SQLITE $Virus_db "select * from scan where starttime='$starttime' and type=$type and week='$week'"| while read file2;do
                                     datatmp2sid=`echo $file2|awk -F'|' '{print $1}'`
                                     datastring2=`echo $file2|awk -F'|' '{print $2}'`
                                     if [ "$week" == "" ];then 
                                         week="*"
                                     fi
                                     sudo mv ${crond_conf} ${tmp_crond_conf}
                                     sudo chmod 777 ${tmp_crond_conf}
                                     echo "$starttimeM $starttimeH * * $week ${eg1p} $EXECUTE_ITEM "/raid/data/module/clamav/log/finish_$datatmp2sid.log" "/home/louis_server/$datastring2" > /raid/data/module/clamav/log/scan_$datatmp2sid.log 2>&1" >> ${tmp_crond_conf}
                                     sudo mv ${tmp_crond_conf} ${crond_conf}
                                  done
                            fi      
                       fi
                 fi   
           fi
     done
     sudo cat ${crond_conf} | crontab - -u root
}

EXECUTE_ITEM_SELECTE(){
    AFTER_DETECTION=`$SQLITE $Virus_db "select handletype from scan where sid='$1'"`
    if [ "${AFTER_DETECTION}" == "1" ];then
        EXECUTE_ITEM="-r --remove -l"
    else
        EXECUTE_ITEM="-r -l"
    fi
}
case "$1" in
## Now task
'0')
    crontable_handle
    EXECUTE_ITEM_SELECTE $2
    ## Immediately run eg1 and update DB status value = 1 (Scanning)
    [ ! -d /raid/data/module/clamav/log ] && mkdir /raid/data/module/clamav/log
    /raid/data/module/clamav/system/bin/clamscan $EXECUTE_ITEM "/raid/data/module/clamav/log/finish_$2.log" "/home/louis_server/$3" > /raid/data/module/clamav/log/scan_$2.log 2>&1 &
    $SQLITE $Virus_db "update scan set status='1' where sid='$2'"
    ;;
## Daily & delete task
'1')
    EXECUTE_ITEM_SELECTE $2 
    crontable_handle $2 $3
    ;;
## Weekly
'2')
    EXECUTE_ITEM_SELECTE $2
    crontable_handle $2 $3
    ;;
*)
esac
