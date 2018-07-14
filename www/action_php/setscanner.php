<?

$dirfile = $_POST['dirfile'];
$type = $_POST['type'];
$handletype = $_POST['handletype'];
$starttime = $_POST['starttime'];
$week = rtrim($_POST['week'], ',');
$db_cmd = 'sqlite /raid/data/module/clamav/system/virus.db';

if($_POST['action'] == 'add'){
    $sid = date('ymdHis');
    $sid_sql = "'${sid}'";
    $dirfile_sql = "'${dirfile}'";
    $last_scan = "''";
    $status = "'0'";
    $type_sql = "'${type}'";
    $starttime_sql = "'${starttime}'";
    $week_sql = "'${week}'";
    $handletype_sql = "'${handletype}'";
    shell_exec(${db_cmd}. ' "INSERT INTO scan VALUES(' .${sid_sql}. ', ' .${dirfile_sql}. ', ' .${last_scan}. ', ' . ${status}. ', ' .${type_sql}. ', ' .${starttime_sql}. ', ' .${week_sql}. ', ' .${handletype_sql}. ');"');
    $target_folder=trim(shell_exec(${db_cmd}. ' "select dirfile text from scan where sid=' .${sid}. '"'));
    $shell = "/raid/data/module/clamav/system/bin/ScanSchedule.sh \"$type\" \"$sid\" \"$target_folder\"";
    shell_exec($shell);
}

if($_POST['action'] == 'edit'){
    $sid = $_POST['sid'];
    $sid_sql = "'${sid}'";
    $dirfile_sql = "'${dirfile}'";
    $last_scan = "''";
    $status = "'0'";
    $type_sql = "'${type}'";
    $starttime_sql = "'${starttime}'";
    $week_sql = "'${week}'";
    $handletype_sql = "'${handletype}'";
    shell_exec(${db_cmd}. ' "update scan set dirfile=' .${dirfile_sql}. ', lastscan=' .${last_scan}. ', status=' . ${status}. ', type=' .${type_sql}. ', starttime=' .${starttime_sql}. ', week=' .${week_sql}. ', handletype=' .${handletype_sql}. ' where sid=' .${sid}. '"');
    $target_folder=trim(shell_exec(${db_cmd}. ' "select dirfile text from scan where sid=' .${sid}. '"'));
    $shell = "/raid/data/module/clamav/system/bin/ScanSchedule.sh \"$type\" \"$sid\" \"$target_folder\"";
    shell_exec($shell);
}

if($_POST['action'] == 'delete'){
    $sid = $_POST['sid'];
    $sid_sql = "'${sid}'";
    shell_exec(${db_cmd}. ' "delete from scan where sid=' .${sid_sql}. '"');
    $shell = "/raid/data/module/clamav/system/bin/ScanSchedule.sh 1 ";
    shell_exec($shell);
    $task_pid=trim(shell_exec("ps www | grep finish_".${sid}.".log | grep -v grep | awk -F'\ ' '{print $1}'"));
    if("$task_pid" != "" ) shell_exec("kill -9 ".$task_pid." > /dev/null");
}

if($_POST['action'] == 'start'){
    $sid = $_POST['sid'];
    $status = "'1'";
    shell_exec(${db_cmd}. ' "update scan set status=' .${status}. 'where sid=' .${sid}. '"');
    $target_folder=trim(shell_exec(${db_cmd}. ' "select dirfile text from scan where sid=' .${sid}. '"'));
    $shell = "/raid/data/module/clamav/system/bin/ScanSchedule.sh 0 \"$sid\" \"$target_folder\"";
    shell_exec($shell);
    
}

if($_POST['action'] == 'stop'){
    $sid = $_POST['sid'];

    // Get pid of this task
    $shell = "ps www | grep module/clamav/system/bin/clamscan | grep $sid | awk {'print $1'}";
    $pid = trim(shell_exec($shell));

    if($_POST['type'] == '0'){
        // Kill this process
        $shell = "kill -9 $pid";
        shell_exec($shell);
        $status = "'4'";
        shell_exec(${db_cmd}. ' "update scan set status=' .${status}. 'where sid=' .${sid}. '"');
    }

    if($_POST['type'] == '1' || $_POST['type'] == '2'){
        // Get all sid with the same time setting
        $shell = "ps www | grep module/clamav/system/bin/clamscan | grep $sid | grep -v /bin/sh | awk -F 'clamscan ' {'print $2'}";
        $sidarray = preg_split("/\s/",trim(shell_exec($shell)));

        // Get pid
        $shell = "ps www | grep module/clamav/system/bin/clamscan | grep $sid | grep -v /bin/sh | awk {'print $1'}";
        $pid = trim(shell_exec($shell));

        // Kill pid
        $shell = "kill -9 $pid";
        shell_exec($shell);

        // Set all schedule task status = 0 (wait)
        $status = "'0'";
        for($i=1; $i<=$sidarray[0]; $i++)
        {
            shell_exec(${db_cmd}. ' "update scan set status=' .${status}. 'where sid=' .${i}. '"');
        }

        // Rebuild crontab
        $shell = "/raid/data/module/clamav/system/bin/ScanSchedule.sh 1 ";
        shell_exec($shell);
    }
}

?>
