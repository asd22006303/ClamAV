<?
$data_scan = array();
$sid = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "select sid from scan"'));
if($sid != ''){
    $sid_list = explode("\n", $sid);
    for($x=0;$x<count($sid_list);$x++){
        $task = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "select * from scan where sid='.$sid_list[$x].'"'));
        $task_list = explode("|", $task);
        $sid = $task_list[0];
        $dirfile = $task_list[1];
        $lastscan = $task_list[2];
        if($task_list[3] == '0'){
            $status = 'Wait...';
        }else if($task_list[3] == '1'){
            $status = 'Scanning...';
        }else if($task_list[3] == '4'){
            $status = 'Terminate';
        }else{
            $status = 'Finish';
        }
        $type = $task_list[4];
        $starttime = $task_list[5];
        $week = $task_list[6];
        $handletype = $task_list[7];
        $quarantine_count = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "SELECT COUNT(*) FROM quarantine WHERE sid='.$sid_list[$x].'"'));
        $virusdelete_count = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "SELECT COUNT(*) FROM virusdelete WHERE sid='.$sid_list[$x].'"'));
        $inflect_count = ${quarantine_count} + ${virusdelete_count};
        array_push($data_scan, array('sid' => $sid, 'dirfile' => $dirfile, 'lastscan' => $lastscan, 'status' => $status, 'type' => $type, 'starttime' => $starttime, 'week' => $week, 'handletype' => $handletype,'count' => $inflect_count));
        # Chanfe the task status from Scanning... to Finish.
        $shell = "ps www | grep $sid_list[$x] | grep -v grep | awk {'print $1'}";
        $pid = trim(shell_exec($shell));
        if( `ps | grep $pid` == "" && $task_list[3] == '1'){
            $NOW_YEAR=trim(shell_exec("date | awk -F' ' '{print $6}'"));
            $NOW_MON=trim(shell_exec("date | awk -F' ' '{print $2}'"));
            $NOW_DAY=trim(shell_exec("date | awk -F' ' '{print $3}'"));
            $NOW_TIME=trim(shell_exec("date | awk -F' ' '{print $4}'"));
            $ALL_TIME="$NOW_YEAR $NOW_MON $NOW_DAY $NOW_TIME";
            shell_exec("sqlite /raid/data/module/clamav/system/virus.db \"update scan set status=2, lastscan='$ALL_TIME' where sid=$sid\"");
            $SCAN_LIST_LOG="/raid/data/module/clamav/log/scan_$sid_list[$x].log";
            $AFTER_DETECTION=trim(shell_exec("sqlite /raid/data/module/clamav/system/virus.db \"select handletype from scan where sid='$sid_list[$x]'\""));
            if(file_exists("$SCAN_LIST_LOG")){
                shell_exec("sh /raid/data/module/clamav/system/bin/InsertScan.sh $sid_list[$x] $AFTER_DETECTION");
            }
        }
    }
}
$data_scan_json = json_encode($data_scan);
echo $data_scan_json;
?>
