import sys

import pymongo
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.json_util import dumps
from sklearn import linear_model
import codecs, json
import numpy as np
from enum import Enum

from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVR


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


app = Flask(__name__)
app.debug = True

# Database
client = MongoClient('localhost', 27017)

db = client['XPOL']

xpoAppliance = db['things']


def error(code, message):
    return jsonify({code: code, message: message})


# LASSSO
@app.route("/svm")
def lasso():
    lassoInputX = []
    lassoInputY = []

    # i = 0
    allProductsVal = []
    allClientsVal = []
    aweights = []

    allProducts = {}
    allClients = {}

    svmRegressor = SVR(kernel='rbf', degree=2, gamma='auto', coef0=1.0, tol=0.003, C=0.5, epsilon=0.4, shrinking=True,
                       cache_size=100, verbose=True, max_iter=10)
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    zip_code = request.args.get('zipcode', '')
    monthId = request.args.get('month', '')

    zip_code_array = [zip_code, "'" + zip_code + "'", "'" + zip_code + " '"]
    cursor = xpoAppliance.find({"ToZip": {'$in': zip_code_array}})
    for document in cursor:
        xData = []
        yData = []
        m = document['DeliveryDate'].split('-')[1]
        j = document['Job_Count']

        yData.append(str(j).replace("'", "").replace(" ", "").replace("-", ""))
        aweights.append([1, 1, 0, 0])
        xData.append(m)  # month
        xData.append(document['ToZip'].replace("'", "").replace("-", ""))
        xData.append(document['ProductDescription'])
        xData.append(document['Client'])

        allProducts[document['ProductDescription']] = -1
        allProductsVal.append(document['ProductDescription'])
        allClientsVal.append(document['Client'])
        allClients[document['Client']] = -1
        # xData.append(++i)

        addName = True
        for k in xData:
            if k is '':
                addName = False
                break
        if addName is True:
            lassoInputX.append(xData)
            lassoInputY.append(yData)

    product_encoder = LabelEncoder()
    product_encoder.fit(allProductsVal)
    client_encoder = LabelEncoder()
    client_encoder.fit(allClientsVal)

    for k, v in allProducts.items():
        allProducts[k] = product_encoder.transform([k])[0]

    for k, v in allClients.items():
        allClients[k] = client_encoder.transform([k])[0]

    for x in lassoInputX:
        x[2] = allProducts[x[2]]
        x[3] = allClients[x[3]]
        print(x)

    svmRegressor.fit(lassoInputX, np.ravel(lassoInputY, order='C'))

    X = np.random.randn(10, 5)

    all_values = []
    all_product_clients={}
    for product in allProducts:
        for client in allClients:
            pred = svmRegressor.predict(
                [[monthId, zip_code, product_encoder.transform([product])[0], client_encoder.transform([client])[0]]])
            if (pred[0] > 0):
                val=str( (pred[0])-int(pred[0]))[2:3]
                all_values.append({'zipcode': zip_code, 'product': product, 'client': client, 'value': val})
                if (product  in all_product_clients):
                    if(client in all_product_clients[product]):
                        all_product_clients[product][client]+=val
                    else :
                        all_product_clients[product][client]  = val
                else:
                    all_product_clients[product] = {}
                    all_product_clients[product][client] = val

    return json.dumps({"products":all_product_clients,"result": all_values}, sort_keys=True,
                      indent=4, cls=NumpyEncoder)


# {"result": {'zipcode':zip_code,'product':product,'client':client,'value':pred},"products":["product1":{"client1":"6"}]}:

if __name__ == "__main__":
    app.run()
