# -*- coding:utf-8 -*-
"""
@summary:This module is for UI settings
@version:1.0.0-1
@author:Fabian Lin,
"""
import os

from FileHandler import FileExplorer

class DataHandler(object):

    def get_list(self, base_path, path, show_hidden=False, rsync_check=[], folder_only=False, iscsi_backup=False, usb=False, mode=''):
        if not base_path:
            base_path = '/home/louis_rpi/Scan_folder'

        folder_list = []
        list = sorted(FileExplorer.listdir(os.path.join(base_path, path)))

        for i in list:
            if not show_hidden and i[0] == '.':
                continue
            default = {
                'path': os.path.join(path, i),
                'directory': True,
                'name': i,
            }
            if mode == 'source' or mode == '':
                if os.path.join(path, i) in rsync_check:
                    default.update({'checked': True})

            if not FileExplorer.is_directory(os.path.join(base_path, default['path'])):
                default['directory'] = False
            if folder_only is True:
                if default['directory'] is True:
                    folder_list.append(default)
                    continue
            else:
                folder_list.append(default)
        return folder_list
