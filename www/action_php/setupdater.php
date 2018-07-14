<?
$db_cmd = 'sqlite /raid/data/module/clamav/system/virus.db';

if($_POST['action'] == 'setschedule'){
    $schedule = $_POST['schedule'];
    $schedule_sql = "'$schedule'";

    $type = $_POST['type'];
    $type_sql = "'$type'";

    $starttime = $_POST['starttime'];
    $starttime_sql = "'$starttime'";

    $week = rtrim($_POST['week'], ',');
    $week_sql = "'$week'";

    shell_exec(${db_cmd}. ' "update updater set schedule=' .${schedule_sql}. ', type=' .${type_sql}. ' , starttime=' .${starttime_sql}. ' , week=' .${week_sql}. '"');
    shell_exec("/raid/data/module/clamav/system/bin/S_UpdateVirusCode.sh");
}

if($_POST['action'] == 'updatenow'){
    shell_exec(${db_cmd}. ' "update updater set status=\'0\'"');   
    shell_exec("/raid/data/module/clamav/system/bin/S_UpdateVirusCode.sh 0 now");
}
?>
