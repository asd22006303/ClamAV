# This is website for clamav module.

You can put project into web service folder and follow notifition to change setting.

Notification:
1. Change "www/action_php/UIData.py" file that incluing "base_path" varible for assigning scan folder.
2. mkdir -p /raid/data/module/clamav/system
3. mount --bind /var/www/html/clamav/ /raid/data/module/clamav/
