<?
$sid = $_GET['sid'];
$data = trim(shell_exec('sqlite /raid/data/module/clamav/system/virus.db "select * from scan where sid='.${sid}.'"'));

$data_list = explode("|", $data);
$dirfile = $data_list[1];
$lastscan = $data_list[2];
$status = $data_list[3];
$type = $data_list[4];
$starttime = $data_list[5];
$week = $data_list[6];
$handletype = $data_list[7];

$data_json = json_encode(array('sid' => $sid, 'dirfile' => $dirfile, 'lastscan' => $lastscan, 'status' => $status, 'type' => $type, 'starttime' => $starttime, 'week' => $week, 'handletype' => $handletype));

?>

<head>
    <link href="./styles/kendo.common.min.css" rel="stylesheet"/>
    <link href="./styles/kendo.silver.min.css" rel="stylesheet"/>
    <link href="./styles/kendo.silver.mobile.min.css" rel="stylesheet"/>
    <link href="./styles/bootstrap.min.css" rel="stylesheet"/>
    <link href="./styles/virus.all.css" rel="stylesheet"/>
    <script src="./js/jquery.min.js"></script>
    <script src="./js/virus.all.js"></script>
    <script src="./js/kendo.mobile.min.js"></script>
    <script src="./js/kendo.all.min.js"></script>
    <script src="./js/bootstrap.min.js"></script>
    <style type="text/css">
        .checkbox_format {
            margin-left: -25px;
        }
        .numeric_hint .k-invalid-msg {
            margin-top: 10px;
            float: left;
        }
        .area {
            width: 49%;
            border: 1px solid #CCCCCC;
            margin-top: 5px;
        }
        .area li {
            list-style:none;
            margin-left: -30px;
            margin-top: 5px;
        }
        #tabstrip-1 .k-grid-content {
            position: absolute;
            bottom: 35px;
            left: 0px;
            right: 0px;
            top: 65px;
            overflow-y:auto;
            height:auto !important;
        }
        #tabstrip-1 .k-grid-pager {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
        }
        #virus_control_panel {
            width:1004px;
            margin:0 auto;
            position: relative;
            height: 685px;
        }
        #left {
            width: 29%;
            height: 230px;
            float: left;
        }
        #right {
            width: 70%;
            height: 230px;
            float: left;
        }
    </style>
</head>

<body>
    <div id="left" class="scrollable area"">
        <label>Scan directory / file:</label>
        <div id='target_tree'></div>
    </div>
    <div id="right" class="area" style="display: inline-block; float: right">
        <div style="margin: 10px; margin-left: 20px;">
            <label class="textfield_title">After detection:</label>
            <input id="quar_mode" type="radio" name="handletype" value="0" checked/>
            <label for="quar_mode" style="width: 150px;margin-left: 10px;">Quarantine</label>
            <input id="delete_mode" type="radio" name="handletype" value="1">
            <label for="delete_mode" style="width: 150px;margin-left: 10px;">Delete virus</label>
        </div>
        <div style="margin: 10px; margin-left: 20px;">
            <label>Deleted infected file information will be stored here:/NAS_Public/clamav_yyyyMMdd_HHmmss<label>
        </div>
        <div style="margin: 10px; margin-left: 20px;">
            <label class="textfield_title">Scanning Interval:</label>
            <input id="now" type="radio" name="scheduletype" value="0" checked/>
            <label for="now" style="width: 100px;margin-left: 10px;">New</label>
            <input id="daily" type="radio" name="scheduletype" value="1">
            <label for="daily" style="width: 100px;margin-left: 10px;">Daily</label>
            <input id="weekly" type="radio" name="scheduletype" value="2">
            <label for="weekly" style="width: 100px;margin-left: 10px;">Weekly</label>
        </div>
        <div id="time_div" style="margin: 10px; margin-left: 20px;">
            <label class="textfield_title">Start time:</label>
            <select id="time"></select>
        </div>
        <div id="week1_div" style="margin: 10px; margin-left: 20px;">
            <label class="textfield_title">Week:</label>
            <input id="monday" name="monday" type="checkbox">
            <label for="monday" style="margin-left: 10px; width: 80px;">Monday</label>
            <input id="tuesday" name="tuesday" type="checkbox">
            <label for="tuesday" style="margin-left: 10px; width: 80px;">Tuesday</label>
            <input id="wednesday" name="wednesday" type="checkbox">
            <label for="wednesday" style="margin-left: 10px; width: 80px;">Wednesday</label>
            <input id="thursday" name="thursday" type="checkbox">
            <label for="thursday" style="margin-left: 10px;">Thursday</label>
        </div>
        <div id="week2_div" style="margin: 10px; margin-left: 228px;">
            <input id="friday" name="friday" type="checkbox">
            <label for="friday" style="margin-left: 10px; width: 80px;">Friday</label>
            <input id="saturday" name="saturday" type="checkbox">
            <label for="saturday" style="margin-left: 10px; width: 80px;">Saturday</label>
            <input id="sunday" name="sunday" type="checkbox">
            <label for="sunday" style="margin-left: 10px; width: 80px;">Sunday</label>
        </div>
    </div>
    <div style="margin: 10px; margin-left: 20px;">
        <div id="cancel_btn" style="margin: 15px; margin-left: 5px; float: right"><label>Cancel</label></div>
        <div id="apply_btn" style="margin: 15px; margin-right: 5px; float: right;"><label>Apply</label></div>
    </div>
</body>

<script>
    initTreeView($('#target_tree'), undefined, no_action, true);
    $("#target_tree").on("change", ":checkbox", function(e) {
        var tree = $("#target_tree").data("kendoTreeView");                                   
        uncheck(tree.dataSource.data());                                                      
        tree.dataItem(e.currentTarget).set("checked", true);
        var source_data = getTreeViewNode($("#target_tree"), 1);
        componentEnableHandler($('#apply_btn'), true, (source_data.length >= 1), 1);
    });
</script>

<script>
    var data = <?echo $data_json;?>;
    week_list = data.week.split(',');
    for(var i in week_list){
        if(week_list[i] == '1'){data['monday'] = '1';};
        if(week_list[i] == '2'){data['tuesday'] = '1';};
        if(week_list[i] == '3'){data['wednesday'] = '1';};
        if(week_list[i] == '4'){data['thursday'] = '1';};
        if(week_list[i] == '5'){data['friday'] = '1';};
        if(week_list[i] == '6'){data['saturday'] = '1';};
        if(week_list[i] == '0'){data['sunday'] = '1';};
    };

    $("#apply_btn").kendoButton().click(function(){
        LoadingWindowShow();
        var source_data = getTreeViewNode($("#target_tree"), 1);
        componentEnableHandler($('#select_btn'), true, (source_data.length >= 1), 1);
        var source_dataSource = new kendo.data.DataSource({
            data: source_data
        });

        var get_week = [
            { 'key': 'monday', 'type':'checkbox', 'id': 'monday' },
            { 'key': 'tuesday', 'type':'checkbox', 'id': 'tuesday' },
            { 'key': 'wednesday', 'type':'checkbox', 'id': 'wednesday' },
            { 'key': 'thursday', 'type':'checkbox', 'id': 'thursday' },
            { 'key': 'friday', 'type':'checkbox', 'id': 'friday' },
            { 'key': 'saturday', 'type':'checkbox', 'id': 'saturday' },
            { 'key': 'sunday', 'type':'checkbox', 'id': 'sunday' }
        ];
        var week_data = getData(get_week, {});
        var week = '';
        if(week_data.monday == '1'){
            week = week.concat('1,');
        }
        if(week_data.tuesday == '1'){
            week = week.concat('2,');
        }
        if(week_data.wednesday == '1'){
            week = week.concat('3,');
        }
        if(week_data.thursday == '1'){
            week = week.concat('4,');
        }
        if(week_data.friday == '1'){
            week = week.concat('5,');
        }
        if(week_data.saturday == '1'){
            week = week.concat('6,');
        }
        if(week_data.sunday == '1'){
            week = week.concat('0,');
        }

        var get_data = [
            { 'key': 'handletype', 'type': 'radio', 'id': 'handletype' },
            { 'key': 'type', 'type': 'radio', 'id': 'scheduletype' },
            { 'key': 'starttime', 'type': 'kendoDropDownList', 'id': 'time' }
        ];
        var final_data = getData(get_data, {});

        final_data['dirfile'] = source_data[0].value;
        final_data['week'] = week;
        final_data['sid'] = data.sid;
        final_data['action'] = 'edit';

        $.ajax({
                url: 'action_php/setscanner.php',
                type: 'POST',
                data: final_data,
                error: no_action,
                success: function(result){
                    LoadingWindowClose();
                    window.top.$("#" + 'edit_scanner_window' ).data("kendoWindow").close();
                }
        });
    });
    $("#cancel_btn").kendoButton().click(function(){
        window.top.$("#" + 'edit_scanner_window' ).data("kendoWindow").close();
    });
    var all_time = [
        { starttime: "12:00 AM"}, { starttime: "12:15 AM"}, { starttime: "12:30 AM"}, { starttime: "12:45 AM"},
        { starttime: "1:00 AM"}, { starttime: "1:15 AM"}, { starttime: "1:30 AM"}, { starttime: "1:45 AM"},
        { starttime: "2:00 AM"}, { starttime: "2:15 AM"}, { starttime: "2:30 AM"}, { starttime: "2:45 AM"},
        { starttime: "3:00 AM"}, { starttime: "3:15 AM"}, { starttime: "3:30 AM"}, { starttime: "3:45 AM"},
        { starttime: "4:00 AM"}, { starttime: "4:15 AM"}, { starttime: "4:30 AM"}, { starttime: "4:45 AM"},
        { starttime: "5:00 AM"}, { starttime: "5:15 AM"}, { starttime: "5:30 AM"}, { starttime: "5:45 AM"},
        { starttime: "6:00 AM"}, { starttime: "6:15 AM"}, { starttime: "6:30 AM"}, { starttime: "6:45 AM"},
        { starttime: "7:00 AM"}, { starttime: "7:15 AM"}, { starttime: "7:30 AM"}, { starttime: "7:45 AM"},
        { starttime: "8:00 AM"}, { starttime: "8:15 AM"}, { starttime: "8:30 AM"}, { starttime: "8:45 AM"},
        { starttime: "9:00 AM"}, { starttime: "9:15 AM"}, { starttime: "9:30 AM"}, { starttime: "9:45 AM"},
        { starttime: "10:00 AM"}, { starttime: "10:15 AM"}, { starttime: "10:30 AM"}, { starttime: "10:45 AM"},
        { starttime: "11:00 AM"}, { starttime: "11:15 AM"}, { starttime: "11:30 AM"}, { starttime: "11:45 AM"},
        { starttime: "12:00 PM"}, { starttime: "12:15 PM"}, { starttime: "12:30 PM"}, { starttime: "12:45 PM"},
        { starttime: "1:00 PM"}, { starttime: "1:15 PM"}, { starttime: "1:30 PM"}, { starttime: "1:45 PM"},
        { starttime: "2:00 PM"}, { starttime: "2:15 PM"}, { starttime: "2:30 PM"}, { starttime: "2:45 PM"},
        { starttime: "3:00 PM"}, { starttime: "3:15 PM"}, { starttime: "3:30 PM"}, { starttime: "3:45 PM"},
        { starttime: "4:00 PM"}, { starttime: "4:15 PM"}, { starttime: "4:30 PM"}, { starttime: "4:45 PM"},
        { starttime: "5:00 PM"}, { starttime: "5:15 PM"}, { starttime: "5:30 PM"}, { starttime: "5:45 PM"},
        { starttime: "6:00 PM"}, { starttime: "6:15 PM"}, { starttime: "6:30 PM"}, { starttime: "6:45 PM"},
        { starttime: "7:00 PM"}, { starttime: "7:15 PM"}, { starttime: "7:30 PM"}, { starttime: "7:45 PM"},
        { starttime: "8:00 PM"}, { starttime: "8:15 PM"}, { starttime: "8:30 PM"}, { starttime: "8:45 PM"},
        { starttime: "9:00 PM"}, { starttime: "9:15 PM"}, { starttime: "9:30 PM"}, { starttime: "9:45 PM"},
        { starttime: "10:00 PM"}, { starttime: "10:15 PM"}, { starttime: "10:30 PM"}, { starttime: "10:45 PM"},
        { starttime: "11:00 PM"}, { starttime: "11:15 PM"}, { starttime: "11:30 PM"}, { starttime: "11:45 PM"},
    ];
    $("#time").kendoDropDownList({
        dataTextField: "starttime",
        dataValueField: "starttime",
        dataSource: all_time,
        index: 1
    });
    componentEnableHandler($("#time_div"), false, false, 1, false);
    componentEnableHandler($("#week1_div"), false, false, 1, false);
    componentEnableHandler($("#week2_div"), false, false, 1, false);

    var update_assign = [
        {'type': 'label', 'id': 'scan_dir_file', 'data': 'dirfile'}, 
        {'type': 'radio', 'id': 'handletype', 'data': 'handletype'},
        {'type': 'radio', 'id': 'scheduletype', 'data': 'type'},
        {'type': 'kendoDropDownList', 'id': 'time', 'data': 'starttime'},
        {'type': 'checkbox', 'id': 'monday', 'data': 'monday'},
        {'type': 'checkbox', 'id': 'tuesday', 'data': 'tuesday'},
        {'type': 'checkbox', 'id': 'wednesday', 'data': 'wednesday'},
        {'type': 'checkbox', 'id': 'thursday', 'data': 'thursday'},
        {'type': 'checkbox', 'id': 'friday', 'data': 'friday'},
        {'type': 'checkbox', 'id': 'saturday', 'data': 'saturday'},
        {'type': 'checkbox', 'id': 'sunday', 'data': 'sunday'}
    ];
    assignValue(data, update_assign);

    $(document).on('change', '#now, #daily, #weekly', function(){
        componentEnableHandler($("#time_div"), false, $("#daily").prop('checked') || $("#weekly").prop('checked'), 1);
        componentEnableHandler($("#week1_div"), false, $("#weekly").prop('checked'), 1);
        componentEnableHandler($("#week2_div"), false, $("#weekly").prop('checked'), 1);
    });
    componentEnableHandler($("#time_div"), false, $("#daily").prop('checked') || $("#weekly").prop('checked'), 1);
    componentEnableHandler($("#week1_div"), false, $("#weekly").prop('checked'), 1);
    componentEnableHandler($("#week2_div"), false, $("#weekly").prop('checked'), 1);
    componentEnableHandler($('#apply_btn'), true, false, 1);

</script>
