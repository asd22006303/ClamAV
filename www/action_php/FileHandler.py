# -*- coding:utf-8 -*-
'''
@summary: A module to handle all file event, such as create, delete, copy
@version: 1.0.0-1
@author: Fabian Lin
'''
import os
import stat
import shutil
import re
import codecs
import tarfile
import time
import hashlib

class FileExplorer(object):
    """

    """
    @staticmethod
    def _encode_path(path):
        return os.path.join(path)

    @staticmethod
    def is_directory(path):
        """
        @summary: check the path is directory or not
        @param: path
        @return: True for directory, False for not a directory
        """
        path = FileExplorer._encode_path(path)
        if os.path.isdir(path):
            return True
        else:
            return False
    @staticmethod
    def listdir(path, mode=0, sort=True):
        """
        @summary: list all directory of this directory
        @param path: directory path
        @return: List with file and folder names
        """
        try:
            path = FileExplorer._encode_path(path)
            result = os.listdir(path)
            if sort is True:
                result.sort()

            if mode == 1:
                tmp = []
                for i in result:
                    tmp.append(os.path.join(path, i))
                return tmp

            return result
        except OSError:
            log.catch_exception()
            return []
