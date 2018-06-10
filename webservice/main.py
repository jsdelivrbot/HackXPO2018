import sys

import pymongo
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.json_util import dumps
from sklearn import linear_model
import codecs, json
import numpy as np
from enum import Enum
from sklearn.ensemble import RandomForestRegressor
from sklearn.neural_network import MLPRegressor

# import pyowm
# owm = pyowm.OWM('9937a62cc5701ed65b207e75fa28e599')  # You MUST provide a valid API key

'''
#Weather
Spring: April - June
Summer: July - September
Fall: October - December
Winter: January - March

    Spring = 1
    Summer = 2
    Fall = 3
    Winter=4
'''


class WEATHER(Enum):
    Spring = 1
    Summer = 2
    Fall = 3
    Winter = 4


class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


app = Flask(__name__)

# Database
client = MongoClient('localhost', 27017)
db = client['XPOL']

logisticsCollection = db['logistics']
lanesCollection = db['lanes']
trucksCollection = db['trucks']
carriersCollection = db['carriers']

lanes = {}
trucks = {}
carriers = {}

cursor = lanesCollection.find({})
for document in cursor:
    lanes[document['Lane']] = document['_id']

cursor = trucksCollection.find({})
for document in cursor:
    trucks[document['name']] = document['_id']

cursor = carriersCollection.find({})
for document in cursor:
    carriers[document['name']] = document['_id']

lassoInputX = []
lassoInputY = []
lassoAccuracyDataset = {}
forecastAccuracyDataset = {}

forecastInputX = []
forecastInputY = []

cursor = logisticsCollection.find({})
logisticsCollectionSize = logisticsCollection.count()
logisticsCollectionTrainSize = int(logisticsCollectionSize - (logisticsCollectionSize * (1 / 7)))
logisticsCollectionTestSize = logisticsCollectionSize - logisticsCollectionTrainSize;

print("Collection Total Size: " + str(logisticsCollectionSize))
print("Collection Train Size: " + str(logisticsCollectionTrainSize))
print("Collection Test Size: " + str(logisticsCollectionTestSize))

i = 0
for document in cursor:
    xData = []
    yData = []
    xData.append(carriers[document['Carrier']])
    xData.append(trucks[document['Equipment Type']])
    xData.append(lanes[document['Lane']])
    xData.append(document["Fuel Charge"])

    yData.append(document['Total_Cost_USD'])
    # print("Collection Test Size: " + str(i))
    if i < logisticsCollectionTrainSize:
        # print("Train Add" + str(i))
        # Regression Model
        lassoInputX.append(xData)
        # FORECAST MODEL
        xxData = xData[:]
        xxData.append(document["Buy RPM (All-In)"])
        forecastInputX.append(xxData)
        forecastInputY.append(yData)
        lassoInputY.append(yData)
    else:
        # print("Train Test Add" + str(i))
        forecastAccuracyDataset.update({i: {0: document['Total_Cost_USD'], 1: xxData}})
        lassoAccuracyDataset.update({i: {0: document['Total_Cost_USD'], 1: xData}})
    i += 1

lassoModel = linear_model.Lasso(alpha=.2)
lassoModel.fit(lassoInputX, lassoInputY)

elasticNetModel = linear_model.ElasticNet(alpha=.2)
elasticNetModel.fit(lassoInputX, lassoInputY)

randomForestRegressor = RandomForestRegressor(random_state=1)
randomForestRegressor.fit(lassoInputX, np.ravel(np.array(lassoInputY)))

mlpRegressor = MLPRegressor(activation='relu', max_iter=10000, hidden_layer_sizes=(5, 5, 5))
mlpRegressor.fit(lassoInputX, lassoInputY)

# FORECAST MODEL

lassoForecastModel = linear_model.Lasso(alpha=.2)
lassoForecastModel.fit(forecastInputX, forecastInputY)

elasticNetForecastModel = linear_model.ElasticNet(alpha=.2)
elasticNetForecastModel.fit(forecastInputX, forecastInputY)

randomForestForecastRegressor = RandomForestRegressor(random_state=1)
randomForestForecastRegressor.fit(forecastInputX, np.ravel(np.array(forecastInputY)))

mlpForecastRegressor = MLPRegressor(random_state=1)
mlpForecastRegressor.fit(forecastInputX, forecastInputY)


@app.route("/")
def hello():
    return jsonify(trucks)


def error(code, message):
    return jsonify({code: code, message: message})


@app.route("/revenue")
def revenue():
    lane = request.args.get('lane', '')
    pipe = [
          {'$match': {'Lane': lane}}
        , {'$group': {'_id': None, 'total': {'$sum': '$GM$'}}}]
    result = logisticsCollection.aggregate(pipeline=pipe)
    resultPoints=logisticsCollection.find({'Lane': lane}, {'Order Id': 1,'GM$':1}).sort([("Order Id", pymongo.DESCENDING)]).limit(100);

    resultValues=(list(map((lambda x: x["GM$"]), resultPoints)))
    return dumps({"aggregate":list(result)[0],"x":list(resultValues)})


# LASSSO
@app.route("/lasso")
def lasso():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if bool(urlParmeters) and {'carrier', 'equipment', 'lane', 'fuel'}.issubset(urlParmeters):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = lassoModel.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])

        max_accuracy = float('-inf')
        min_accuracy = float('inf')
        for i, val in lassoAccuracyDataset.items():
            real_value = val[0]
            xData = val[1]
            predicted = lassoModel.predict([xData])
            accuracy = abs(1 - abs(predicted[0] - real_value) / real_value) * 100
            # print(real_value, xData, predicted)
            max_accuracy = max(max_accuracy, accuracy)
            min_accuracy = min(min_accuracy, accuracy)

        return json.dumps({"result": pred,
                           "accuracy": {"train": logisticsCollectionTrainSize, "test": logisticsCollectionTestSize,
                                        "min": min_accuracy, "max": max_accuracy}}, sort_keys=True,
                          indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


# ELASTONET GLM
@app.route("/glm")
def glmElasticNet():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if bool(urlParmeters) and {'carrier', 'equipment', 'lane', 'fuel'}.issubset(urlParmeters):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = elasticNetModel.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        # return json.dumps({"result": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
        max_accuracy = float('-inf')
        min_accuracy = float('inf')
        for i, val in lassoAccuracyDataset.items():
            real_value = val[0]
            xData = val[1]
            predicted = elasticNetModel.predict([xData])

            accuracy = abs(1 - abs(predicted[0] - real_value) / real_value) * 100
            #print("accuracy=",accuracy)

            #accuracy = 100 - ((float(float(real_value - predicted) / real_value)) * 100)
            # print(real_value, xData, predicted)
            max_accuracy = max(max_accuracy, accuracy)
            min_accuracy = min(min_accuracy, accuracy)

        return json.dumps({"result": pred,
                           "accuracy": {"train": logisticsCollectionTrainSize, "test": logisticsCollectionTestSize,
                                        "min": min_accuracy, "max": max_accuracy}}, sort_keys=True,
                          indent=4, cls=NumpyEncoder)


    else:
        return error('201', 'Parameters Missing')


# ANN
@app.route("/ann")
def mlpRegression():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if bool(urlParmeters) and {'carrier', 'equipment', 'lane', 'fuel'}.issubset(urlParmeters):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = mlpRegressor.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        # return json.dumps({"result": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
        max_accuracy = float('-inf')
        min_accuracy = float('inf')
        for i, val in lassoAccuracyDataset.items():
            real_value = val[0]
            xData = val[1]
            predicted = mlpRegressor.predict([xData])
            accuracy = abs(1 - abs(predicted[0] - real_value) / real_value) * 100
            #print("accuracy=",accuracy)
            # print(real_value, xData, predicted)
            max_accuracy = max(max_accuracy, accuracy)
            min_accuracy = min(min_accuracy, accuracy)

        return json.dumps({"result": pred,
                           "accuracy": {"train": logisticsCollectionTrainSize, "test": logisticsCollectionTestSize,
                                        "min": min_accuracy, "max": max_accuracy}}, sort_keys=True,
                          indent=4, cls=NumpyEncoder)


    else:
        return error('201', 'Parameters Missing')


@app.route("/rnd")
def randomForest():
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if bool(urlParmeters) and {'carrier', 'equipment', 'lane', 'fuel'}.issubset(urlParmeters):
        carrier = request.args.get('carrier', '')
        equipment = request.args.get('equipment', '')
        lane = request.args.get('lane', '')
        fuel = request.args.get('fuel', '')
        pred = randomForestRegressor.predict([[float(carrier), float(equipment), float(lane), float(fuel)]])
        max_accuracy = float('-inf')
        min_accuracy = float('inf') 
        for i, val in lassoAccuracyDataset.items():
            real_value = val[0]
            xData = val[1]
            predicted = randomForestRegressor.predict([xData])
            accuracy = abs(1 - abs(predicted[0] - real_value) / real_value) * 100
            #print("accuracy=",accuracy)
            # print(real_value, xData, predicted)
            max_accuracy = max(max_accuracy, accuracy)
            min_accuracy = min(min_accuracy, accuracy)

        return json.dumps({"result": pred,
                           "accuracy": {"train": logisticsCollectionTrainSize, "test": logisticsCollectionTestSize,
                                        "min": min_accuracy, "max": max_accuracy}}, sort_keys=True,
                          indent=4, cls=NumpyEncoder)

        # return json.dumps({"result": pred}, sort_keys=True, indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'''''''''''''''''''FORECAST''''''''''''''''''''''''''''''''''
''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''


# LASSSO
@app.route("/regressionForecast/<algrm>")
def regressionForecast(algrm):
    # xData.append(carriers[document['Carrier']])
    # xData.append(trucks[document['Equipment Type']])
    # xData.append(lanes[document['Lane']])
    # xData.append(document["Fuel Charge"])
    print(set(request.args.keys()))
    urlParmeters = set(request.args.keys())
    if bool(urlParmeters) and {'carrier', 'equipment', 'lane', 'fuel', 'buyrpm'}.issubset(urlParmeters):
        _carriers = request.args.get('carrier', '').split(',')
        _equipments = request.args.get('equipment', '').split(',')
        _lanes = request.args.get('lane', '').split(',')
        _fuels = request.args.get('fuel', '').split(',')
        _buyrpms = request.args.get('buyrpm', '').split(',')
        predictions = []
        print(_fuels)
        print(_buyrpms)

        print(request.args.get('buyrpm', ''))

        pred = 0
        for i in range(len(_carriers)-1):
            index = i
            xInput = [[float(_carriers[index]), float(_equipments[index]), float(_lanes[index]), float(_fuels[index]),
                       float(_buyrpms[index])]]
            if algrm == 'lasso':
                pred = lassoForecastModel.predict(xInput)
            elif algrm == 'glm':
                pred = elasticNetForecastModel.predict(xInput)
            elif algrm == 'rnd':
                pred = randomForestForecastRegressor.predict(xInput)
            elif algrm == 'ann':
                pred = mlpForecastRegressor.predict(xInput)

            if (pred):
                predictions.append({"i": i, "value": pred, "input": xInput})

        max_accuracy = float('-inf')
        min_accuracy = float('inf')
        predicted = 0
        for i, val in forecastAccuracyDataset.items():
            real_value = val[0]
            xData = val[1]
            print(xData)
            if algrm == 'lasso':
                predicted = lassoForecastModel.predict([xData])
            elif algrm == 'glm':
                predicted = elasticNetForecastModel.predict([xData])
            elif algrm == 'rnd':
                predicted = randomForestForecastRegressor.predict([xData])
            elif algrm == 'ann':
                predicted = mlpForecastRegressor.predict([xData])
            accuracy = abs(1 - abs(predicted[0] - real_value) / real_value) * 100
            #print("accuracy=",accuracy)
            # print(real_value, xData, predicted)
            max_accuracy = max(max_accuracy, accuracy)
            min_accuracy = min(min_accuracy, accuracy)

        return json.dumps({"result": predictions, "accuracy": {"min": min_accuracy, "max": max_accuracy}},
                          sort_keys=True, indent=4, cls=NumpyEncoder)
    else:
        return error('201', 'Parameters Missing')


if __name__ == "__main__":
    app.run()
