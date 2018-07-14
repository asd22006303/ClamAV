#!/usr/bin/python
# -*- coding:utf-8 -*-
import sys
import json
if __name__ == "__main__":
    if len(sys.argv) == 2:
        base_path = sys.argv[1]
    else:
        base_path = ''

    from UIData import DataHandler
    folder_list = DataHandler().get_list(None, base_path)
    print json.dumps(folder_list)
