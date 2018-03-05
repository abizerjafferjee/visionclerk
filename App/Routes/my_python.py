import sys
import requests

if __name__ == '__main__':
    app_string = sys.argv
    #print('python program processing this user query: ' + str(app_string[1]))

    # initialize the REST API endpoint URL along with the input
    API_URL = "http://localhost:5000/predict"

    query = str(app_string[1])
    payload = {"query":query}

    # submit the request
    r = requests.post(API_URL, data = payload).json()

    # print (r["table_id"])

    print('documents')
    sys.stdout.flush()
