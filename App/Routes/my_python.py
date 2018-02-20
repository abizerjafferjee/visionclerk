import sys

#libs needed to create a panda data frame
import os
import pandas as pd

def data_to_csv(path):
    file_id = 0
    for root, dirs, files in os.walk(path):
        for file_ in files:
            if (file_[-4:] == ".txt"):
                f_open = os.path.join(root, file_)
                f = open(f_open,"r")
                file_id += 1
                f_name = file_[:-4]
                '''print(file_id)
                print(f_name)
                print(f.read())'''
                data_to_write = str(file_id) + "#" + f_name + "#" + f.read()
                data_to_write = data_to_write.strip()
                #print(data_to_write)
                write_data(root, data_to_write)

def write_data(root_path, data):
    new_csv = root_path + "\data.csv"
    f_csv = open(new_csv,"a")
    f_csv.write(data)
    f_csv.close()

if __name__ == '__main__':
    data_to_csv('C:\\Users\\gilberto\\Desktop\\work\\Freelance\\LegalX\\Data\\small_data_set')
    df = pd.read_csv('C:\\Users\\gilberto\\Desktop\\work\\Freelance\\LegalX\\Data\\small_data_set\\test_data.txt', sep='#')
    app_string = sys.argv
    #print('python program processing this user query: ' + str(app_string[1]))
    #print(df)
    print('documents')
    sys.stdout.flush()
